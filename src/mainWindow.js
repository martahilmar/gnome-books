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
const _WINDOW_MIN_WIDTH = 600;
const _WINDOW_MIN_HEIGHT = 500;

const MainWindow = new Lang.Class({
    Name: 'MainWindow',

    _init: function(app) {
        this._configureId = 0;
        //let ui = Utils.getUIObject('main-window', [ 'app-window' ]);
        this.webView = new WebView.WebView(app);
        this.window = this.webView;
    },

    _initActions: function() {
        Utils.initActions(this.window, [
            {
                properties: { name: 'close' },
                signalHandlers: { activate: this.window.close.bind(this.window) }
            },
        ], this);
    },

    _initSignals: function() {
        this.window.connect('delete-event', this._quit.bind(this));
        this.window.connect('configure-event',
                            this._onConfigureEvent.bind(this));
        this.window.connect('window-state-event',
                            this._onWindowStateEvent.bind(this));
        this.window.connect('key-press-event',
                            this._onKeyPressEvent.bind(this));

        this.webView.view.connect('button-press-event',
                                  this._overlay.grab_focus.bind(this._overlay));
        this._viewMovedId = 0;
    },

    _saveWindowGeometry: function() {
        let window = this.window.get_window();
        let state = window.get_state();

        if (state & Gdk.WindowState.MAXIMIZED)
            return;

        // GLib.Variant.new() can handle arrays just fine
        let size = this.window.get_size();
        Application.settings.set('window-size', size);

        let position = this.window.get_position();
        Application.settings.set('window-position', position);
    },

    _restoreWindowGeometry: function() {
        let size = Application.settings.get('window-size');
        if (size.length === 2) {
            let [width, height] = size;
            this.window.set_default_size(width, height);
        }

        let position = Application.settings.get('window-position');
        if (position.length === 2) {
            let [x, y] = position;

            this.window.move(x, y);
        }

        if (Application.settings.get('window-maximized'))
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
        Application.settings.set('window-maximized', maximized);
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
        // remove configure event handler if still there
        if (this._configureId !== 0) {
            Mainloop.source_remove(this._configureId);
            this._configureId = 0;
        }

        // always save geometry before quitting
        this._saveWindowGeometry();

        return false;
    }
});
