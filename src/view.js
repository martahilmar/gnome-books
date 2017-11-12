/*
 * GNOME Books is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 * 
 * GNOME Books is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License along
 * with GNOME Books; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * Author: Marta Milakovic <marta.milakovic@gmail.com>
 *
 */

const Cairo = imports.gi.cairo;
const Gd = imports.gi.Gd;
const Gdk = imports.gi.Gdk;
const GdkPixbuf = imports.gi.GdkPixbuf;
const Gettext = imports.gettext;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const _ = imports.gettext.gettext;

const Lang = imports.lang;
const Mainloop = imports.mainloop;

const Application = imports.application;
const WindowMode = imports.windowMode;
const Utils = imports.utils;
const Signals = imports.signals;

var ViewModel = new Lang.Class({
    Name: 'ViewModel',

    _init: function() {
        this.model = Gtk.ListStore.new(
            [ GObject.TYPE_STRING,
              GObject.TYPE_STRING,
              GObject.TYPE_STRING,
              GObject.TYPE_STRING,
              Cairo.Surface,
              GObject.TYPE_LONG,
              GObject.TYPE_BOOLEAN,
              GObject.TYPE_UINT ]);

        this.model.set_sort_column_id(Gd.MainColumns.MTIME, Gtk.SortType.ASCENDING);
        
        Application.library.connect('items-added', Lang.bind(this, this._onItemAdded));
    },

    _onItemAdded: function(source, inItems) {
        let items = inItems;
        for(let idx in items)
        {
            let item = items[idx];
            Application.baseManager.addItem(item);
            let iter = this.model.append();
            this.model.set(iter,
                [ 0, 1, 2, 3, 4, 5 ],
                [ item.id, item.path, item.title, item.author,
                  item.icon, Gd.MainColumns.MTIME ]);
        }

        this.emit('query-status-changed');
    },

    _onClear: function() {
        this.model.clear();
    }
});
Signals.addSignalMethods(ViewModel.prototype);

var ViewContainer = new Lang.Class({
    Name: 'ViewContainer',

    _init: function() {
        this._modelVisible = true;
        this._adjustmentValueId = 0;
        this._adjustmentChangedId = 0;
        this._scrollbarVisibleId = 0;

        this._model = new ViewModel();
        
        this.widget = new Gtk.Grid ({ orientation: Gtk.Orientation.VERTICAL });
        this.view = new Gd.MainView ({ shadow_type: Gtk.ShadowType.NONE });
        this.widget.add(this.view);

        this.widget.show_all();

        // connect to settings change for list/grid view
        this._viewSettingsId = Application.settings.connect('changed::view-as',
            Lang.bind(this, this._updateTypeForSettings));
        this._updateTypeForSettings();

        Application.modeController.connect('window-mode-changed', 
                                            Lang.bind(this, this._onWindowModeChanged));
        this.view.connect('item-activated', 
                          Lang.bind(this, this._onItemActivated));
        this._model.connect('query-status-changed', 
                            Lang.bind(this, this._onQueryStatusChanged));

        this._onWindowModeChanged();
    },

    _onItemActivated: function(widget, id, path) {
        Application.baseManager.setActiveItemById(id);      
    },

    _updateTypeForSettings: function() {
        let viewType = Application.settings.get_enum('view-as');
        this.view.set_view_type(viewType);

        if (viewType == Gd.MainViewType.LIST)
            this._addListRenderers();
    },

    _addListRenderers: function() {
        let listWidget = this.view.get_generic_view();

        let typeRenderer =
            new Gd.StyledTextRenderer({ xpad: 16 });
        typeRenderer.add_class('dim-label');
        listWidget.add_renderer(typeRenderer, Lang.bind(this,
            function(col, cell, model, iter) {
                let id = model.get_value(iter, Gd.MainColumns.ID);
                
                typeRenderer.text = "";
            }));
    },

    _onWindowModeChanged: function() {
        let mode = Application.modeController.getWindowMode();
        if (mode == WindowMode.WindowMode.OVERVIEW)
            this._connectView();
        else
            this._disconnectView();
    },

    _onQueryStatusChanged: function() {
        this.view.set_model(this._model.model);
    },

    _connectView: function() {
        this._adjustmentValueId = this.view.vadjustment.connect('value-changed',
                                        Lang.bind(this, this._onScrolledWinChange));
        this._adjustmentChangedId = this.view.vadjustment.connect('changed',
                                        Lang.bind(this, this._onScrolledWinChange));
        this._scrollbarVisibleId = this.view.get_vscrollbar().connect('notify::visible',
                                        Lang.bind(this, this._onScrolledWinChange));
        this._onScrolledWinChange();
    },

    _onScrolledWinChange: function() {
        let vScrollbar = this.view.get_vscrollbar();
        let adjustment = this.view.vadjustment;
        let revealAreaHeight = 32;

        // if there's no vscrollbar, or if it's not visible, hide the button

        if (!vScrollbar ||
            !vScrollbar.get_visible()) {
            return;
        }

        let value = adjustment.value;
        let upper = adjustment.upper;
        let page_size = adjustment.page_size;

        let end = false;

        // special case this values which happen at construction
        if ((value == 0) && (upper == 1) && (page_size == 1))
            end = false;
        else
            end = !(value < (upper - page_size - revealAreaHeight));
    },

    _disconnectView: function() {
        if (this._adjustmentValueId != 0) {
            this.view.vadjustment.disconnect(this._adjustmentValueId);
            this._adjustmentValueId = 0;
        }
        if (this._adjustmentChangedId != 0) {
            this.view.vadjustment.disconnect(this._adjustmentChangedId);
            this._adjustmentChangedId = 0;
        }
        if (this._scrollbarVisibleId != 0) {
            this.view.get_vscrollbar().disconnect(this._scrollbarVisibleId);
            this._scrollbarVisibleId = 0;
        }
    },

    setModel: function(model) {
        if (!model)
        {
            this.widget.hide();
            this._modelVisible = false;
        }
        else
        {
            this.widget.show_all();
            this._modelVisible = false;            
        }
    }
});
