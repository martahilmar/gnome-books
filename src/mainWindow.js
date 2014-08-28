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

const Gdk = imports.gi.Gdk;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;

const Lang = imports.lang;
const Mainloop = imports.mainloop;

const Application = imports.application;
const WebView = imports.webView;
const Config = imports.config;
const Utils = imports.utils;
const MainToolbar = imports.mainToolbar;
const Embed = imports.embed;

const _ = imports.gettext.gettext;

const _CONFIGURE_ID_TIMEOUT = 100; // msecs
const _WINDOW_MIN_WIDTH = 1340;
const _WINDOW_MIN_HEIGHT = 768;

const MainWindow = new Lang.Class({
    Name: 'MainWindow',

    _init: function(app) {
        this.window = new Gtk.ApplicationWindow({ application: app,
                                                  width_request: _WINDOW_MIN_WIDTH,
                                                  height_request: _WINDOW_MIN_HEIGHT,
                                                  window_position: Gtk.WindowPosition.CENTER,
                                                  title: _("GNOME Books") });
        this._initSignals();
        this._restoreWindowGeometry();

        this.window.set_events(Gdk.EventMask.POINTER_MOTION_MASK);

        this._configureId = 0;
        
        this._embed = new Embed.Embed();
        this.window.add(this._embed.widget);
        this.window.show_all();
    },

    _initSignals: function() {
        this.window.connect('delete-event', 
                             Lang.bind(this, this._quit));
        this.window.connect('configure-event',
                             Lang.bind(this, this._onConfigureEvent));
        this.window.connect('window-state-event',
                             Lang.bind(this, this._onWindowStateEvent));
        this.window.connect('key-press-event',
                            Lang.bind(this, this._onKeyPressEvent));
    },

    _saveWindowGeometry: function() {
        let window = this.window.get_window();
        let state = window.get_state();

        if (state & Gdk.WindowState.MAXIMIZED)
            return;

        let size = this.window.get_size();
        let variant = GLib.Variant.new ('ai', size);
        Application.settings.set_value('window-size', variant);

        let position = this.window.get_position();
        variant = GLib.Variant.new ('ai', position);
        Application.settings.set_value('window-position', variant);
    },

    _restoreWindowGeometry: function() {
        let size = Application.settings.get_value('window-size');
        if (size.n_children() == 2) {
            let width = size.get_child_value(0);
            let height = size.get_child_value(1);

            this.window.set_default_size(width.get_int32(), height.get_int32());
        }

        let position = Application.settings.get_value('window-position');
        if (position.n_children == 2) {
            let x = position.get_child_value(0);
            let y = position.get_child_value(1);

            this.window.move(x.get_int32(), y.get_int32());
        }

        if (Application.settings.get_boolean('window-maximized'))
            this.window.maximize();
    },

    _onConfigureEvent: function(widget, event) {
        if (this._configureId !== 0) {
            Mainloop.source_remove(this._configureId);
            this._configureId = 0;
        }

        this._configureId = Mainloop.timeout_add(_CONFIGURE_ID_TIMEOUT, (function() {
            this._saveWindowGeometry();
            this._configureId = 0;
            return false;
        }).bind(this));
    },

    _onWindowStateEvent: function(widget, event) {
        let window = widget.get_window();
        let state = window.get_state();

        if (state & Gdk.WindowState.FULLSCREEN)
            return;

        let maximized = (state & Gdk.WindowState.MAXIMIZED);
        Application.settings.set_boolean('window-maximized', maximized);
    },

    _onKeyPressEvent: function(widget, event) {
        let toolbar = this._embed.getMainToolbar();

        return false;
    },

    _quit: function() {
        if (this._configureId != 0) {
            Mainloop.source_remove(this._configureId);
            this._configureId = 0;
        }

        this._saveWindowGeometry();
        return false;
    },

    showAbout: function() {
        let aboutDialog = new Gtk.AboutDialog();

        aboutDialog.authors = [ 'Marta Milakovic <marta.milakovic@gmail.com>',
                                'Cosimo Cecchi <cosimoc@gnome.org>' ];
        aboutDialog.program_name = _("Books");
        aboutDialog.comments = _("A eBook manager application");
        aboutDialog.license_type = Gtk.License.GPL_2_0;
        aboutDialog.logo_icon_name = 'gnome-books';
        aboutDialog.version = Config.PACKAGE_VERSION;
        aboutDialog.wrap_license = true;

        aboutDialog.modal = true;
        aboutDialog.transient_for = this.window;

        aboutDialog.show();
        aboutDialog.connect('response', function() {
            aboutDialog.destroy();
        });
    }
});