const Gdk = imports.gi.Gdk;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;

const Lang = imports.lang;
const Mainloop = imports.mainloop;

const Application = imports.application;
const WebView = imports.webView;
const Config = imports.config;
const Utils = imports.utils;

const _ = imports.gettext.gettext;

const _CONFIGURE_ID_TIMEOUT = 100; // msecs
const _WINDOW_MIN_WIDTH = 1340;
const _WINDOW_MIN_HEIGHT = 768;

const MainWindow = new Lang.Class({
    Name: 'MainWindow',

    _init: function(app) {
        this._scrolledWindow = new Gtk.ScrolledWindow();
        this.window = new Gtk.ApplicationWindow({ application: app,
                                                  width_request: _WINDOW_MIN_WIDTH,
                                                  height_request: _WINDOW_MIN_HEIGHT,
                                                  window_position: Gtk.WindowPosition.CENTER,
                                                  title: "GNOME Books" });
        this._initSignals();
        this._restoreWindowGeometry();
        this.window.add(this._scrolledWindow);
        this.window.set_position(Gtk.WindowPosition.CENTER);

        this.window.set_events(Gdk.EventMask.POINTER_MOTION_MASK);

        this._configureId = 0;
        this._widget = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL,
                                    visible: true });
        this._overlay = new Gtk.Overlay({ visible: true });
        this._widget.pack_end(this._overlay, true, true, 0);

        this.webView = new WebView.WebView(app, this._overlay);
        this._scrolledWindow.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.NEVER);
        this._scrolledWindow.add(this._widget);

        this.window.show_all();
    },

    _initSignals: function() {
        this.window.connect('delete-event', this._quit.bind(this));
        this.window.connect('configure-event',
                            this._onConfigureEvent.bind(this));
        this.window.connect('window-state-event',
                            this._onWindowStateEvent.bind(this));
        this.window.connect('key-press-event',
                            this._onKeyPressEvent.bind(this));

        this._viewMovedId = 0;
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
        if (size.length === 2) {
            let [width, height] = size;
            this.window.set_default_size(width, height);
        }

        let position = Application.settings.get_value('window-position');
        if (position.length === 2) {
            let [x, y] = position;

            this.window.move(x, y);
        }

        //if (Application.settings.get_value('window-maximized'))
        //    this.window.maximize();
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
        let state = event.get_state()[1];

        if (state & Gdk.ModifierType.CONTROL_MASK) {
            let keyval = event.get_keyval()[1];

            if (keyval === Gdk.KEY_plus)
                this.mapView.view.zoom_in();

            if (keyval === Gdk.KEY_minus)
                this.mapView.view.zoom_out();
        }

        return false;
    },

    _quit: function() {
        if (this._configureId !== 0) {
            Mainloop.source_remove(this._configureId);
            this._configureId = 0;
        }

        //this._overlay.destroy();
        this._saveWindowGeometry();

        return false;
    }
});