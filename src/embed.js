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

const Lang = imports.lang;
const Mainloop = imports.mainloop;

const Application = imports.application;
const MainToolbar = imports.mainToolbar;
const WindowMode = imports.windowMode;
const View = imports.view;
const WebView = imports.webView;

const GbPrivate = imports.gi.GbPrivate;
const Gd = imports.gi.Gd;
const Gdk = imports.gi.Gdk;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;
const _ = imports.gettext.gettext;

const _ICON_SIZE = 128;

const Embed = new Lang.Class({
    Name: 'Embed',

    _init: function() {
        this._noResultsChangeId = 0;

        this.widget = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL,
                                    visible: true });

        let toplevel = Application.application.get_windows()[0];
        this._titlebar = new Gtk.Grid({ visible: true });
        toplevel.set_titlebar(this._titlebar);

        this._stackOverlay = new Gtk.Overlay({ visible: true });
        this.widget.pack_end(this._stackOverlay, true, true, 0);

        this._stack = new Gtk.Stack({ visible: true,
                                      homogeneous: true,
                                      transition_type: Gtk.StackTransitionType.CROSSFADE });
        this._stackOverlay.add(this._stack);

        // now create the actual content widgets
        this._view = new View.ViewContainer();
        this._stack.add_named(this._view.widget, 'view');

        this._read = new WebView.WebView(this._stackOverlay);
        this._stack.add_named(this._read.widget, 'read');

        Application.modeController.connect('window-mode-changed',
                                           Lang.bind(this, this._onWindowModeChanged));
        Application.modeController.connect('fullscreen-changed',
                                           Lang.bind(this, this._onFullscreenChanged));
        Application.baseManager.connect('active-changed',
                                        Lang.bind(this, this._onActiveItemChanged));

        let windowMode = Application.modeController.getWindowMode();
        if (windowMode != WindowMode.WindowMode.NONE)
            this._onWindowModeChanged(Application.modeController, windowMode, WindowMode.WindowMode.NONE);
    },
    
    _onFullscreenChanged: function(controller, fullscreen) {
        this._toolbar.widget.visible = !fullscreen;
        this._toolbar.widget.sensitive = !fullscreen;
    },

    _onWindowModeChanged: function(object, newMode, oldMode) {
        switch (newMode) {
        case WindowMode.WindowMode.OVERVIEW:
            this._prepareForOverview();
            break;
        case WindowMode.WindowMode.READ_VIEW:
            this._prepareForRead();
            break;
        case WindowMode.WindowMode.NONE:
            break;
         default:
            throw(new Error('Not handled'));
            break;
        }
    },
    
    _onActiveItemChanged: function(manager, book) {
        let fName = book.epubName.substring(0, book.epubName.length - 5);
        let cmd = "epub-unpack.sh " + book.path + " " + GLib.get_home_dir() + "/Books/" + fName;
        GLib.spawn_command_line_sync(cmd);

        this._read.onLoadBook(GLib.get_home_dir() + "/Books/" + fName + "/");
        Application.modeController.setWindowMode(WindowMode.WindowMode.READ_VIEW);
    },

    _prepareForOverview: function() {
        if (this._read)
            this._read.setReadModel(false);
        if (this._toolbar)
            this._toolbar.widget.destroy();
        if(this._read.navControls)
            this._read.navControls.hide();

        // pack the toolbar
        this._toolbar = new MainToolbar.OverviewToolbar(this._stackOverlay);
        this._titlebar.add(this._toolbar.widget);

        this._stack.set_visible_child_name('view');
    },

    _prepareForRead: function() {
        if (this._toolbar)
            this._toolbar.widget.destroy();
        
        this._toolbar = new WebView.ReadToolbar(this._read);
        this._titlebar.add(this._toolbar.widget);
        
        if (!this._read.navControls)
            this._read.buildNavControls();
        else
            this._read.navControls.show();

        this._stack.set_visible_child_name('read');
    },

    getMainToolbar: function() {
        let windowMode = Application.modeController.getWindowMode();
        let fullscreen = Application.modeController.getFullscreen();

        if (fullscreen && (windowMode == WindowMode.WindowMode.READ))
            return this._read.getFullscreenToolbar();
        else
            return this._toolbar;
    },

    getRead: function() {
        return this._read;
    }
});
