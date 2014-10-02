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
 
imports.gi.versions.Gtk = '3.0';

const Gtk = imports.gi.Gtk;
const Gd = imports.gi.Gd;
const Gio = imports.gi.Gio;
const Gdk = imports.gi.Gdk;
const GLib = imports.gi.GLib;

const _ = imports.gettext.gettext;

const Lang = imports.lang;
const Mainloop = imports.mainloop;

const Application = imports.application;

const MainToolbar = new Lang.Class ({
	Name: 'MainToolbar',

	_init: function() {
		this.widget = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
		this.widget.show();

		this.toolbar = new Gtk.HeaderBar({ hexpand: true });
		this.toolbar.get_style_context().add_class('titlebar');
        this.toolbar.set_title("GNOME Books");
		this.widget.add(this.toolbar);

		this.toolbar.show();
	},

	addBackButton: function() {
		let backButton = new Gtk.Button({ image: new Gtk.Image ({ icon_name: 'go-previous-symbolic' }),
										  tooltip_text: _("Back") });
		this.toolbar.pack_start(backButton);
		return backButton;
	}
});

const OverviewToolbar = new Lang.Class({
    Name: 'OverviewToolbar',
    Extends: MainToolbar,

    _init: function(overlay) {
        this._overlay = overlay;
        this._collBackButton = null;
        this._collectionId = 0;
        this._selectionChangedId = 0;
        this._selectionMenu = null;
        this._viewGridButton = null;
        this._viewListButton = null;
        this._viewSettingsId = 0;

        this.parent();
        this._resetToolbarMode();

        this.widget.connect('destroy', Lang.bind(this,
            function() {
                this._clearStateData();
            }));
    },

    _addViewAsButtons: function() {
        let viewAsBox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL,
                                      spacing: 0 });
        viewAsBox.get_style_context().add_class('linked');
        this.toolbar.pack_end(viewAsBox);

        this._viewListButton = new Gtk.Button({ image: new Gtk.Image ({ icon_name: 'view-list-symbolic' }),
                                                tooltip_text: _("View items as a list"),
                                                no_show_all: true,
                                                action_name: 'app.view-as',
                                                action_target: GLib.Variant.new('s', 'list') });
        viewAsBox.add(this._viewListButton);
        this._viewGridButton = new Gtk.Button({ image: new Gtk.Image ({ icon_name: 'view-grid-symbolic' }),
                                                tooltip_text: _("View items as a grid of icons"),
                                                no_show_all: true,
                                                action_name: 'app.view-as',
                                                action_target: GLib.Variant.new('s', 'icon') });
        viewAsBox.add(this._viewGridButton);

        this._viewSettingsId = Application.settings.connect('changed::view-as',
            Lang.bind(this, this._updateViewAsButtons));
        this._updateViewAsButtons();
    },

    _updateViewAsButtons: function() {
        let viewType = Application.settings.get_enum('view-as');
        this._viewGridButton.visible = (viewType != Gd.MainViewType.ICON);
        this._viewListButton.visible = (viewType != Gd.MainViewType.LIST);
    },

    _setToolbarTitle: function() {
    },

    _populateForOverview: function() {
        this.toolbar.set_show_close_button(true);

        this._addViewAsButtons();
    },

    _clearStateData: function() {
        this._collBackButton = null;
        //this._viewGridButton = null;
        //this._viewListButton = null;
        this.toolbar.set_custom_title(null);
    },

    _clearToolbar: function() {
        this._clearStateData();
        this.toolbar.set_show_close_button(false);

        let children = this.toolbar.get_children();
        children.forEach(function(child) { child.destroy(); });
    },

    _resetToolbarMode: function() {
        this._clearToolbar();
        this._populateForOverview();

        this.toolbar.show_all();
    }
});