const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Signals = imports.signals;
const Gettext = imports.gettext;
const _ = imports.gettext.gettext;

// Import versions go here
imports.gi.versions.WebKit = '3.0';
imports.gi.versions.Gtk = '3.0';

const GbPrivate = imports.gi.GbPrivate;
const Gdk = imports.gi.Gdk;
const Gio = imports.gi.Gio;
const Goa = imports.gi.Goa;
const Gtk = imports.gi.Gtk;
const GLib = imports.gi.GLib;
const WebKit = imports.gi.WebKit2;

const Main = imports.main;
const Format = imports.format;
const Path = imports.path;
const Utils = imports.utils;
const MainWindow = imports.mainWindow;

// used globally
let application = null;

// used by the application, but not by the search provider
let modeController = null;
let settings = null;

const MINER_REFRESH_TIMEOUT = 60; /* seconds */

const Application = new Lang.Class({
    Name: 'Application',
    Extends: Gtk.Application,

    _init: function() {
        this._activationTimestamp = Gdk.CURRENT_TIME;

        Gettext.bindtextdomain('gnome-books', Path.LOCALE_DIR);
        Gettext.textdomain('gnome-books');
        GLib.set_prgname('gnome-books');
        GLib.set_application_name(_("Books"));

        this.parent({ application_id: 'org.gnome.Books' });
    },

    _onActionQuit: function() {
        this._mainWindow.window.destroy();
    },

    _initActions: function() {
        this._actionEntries.forEach(Lang.bind(this,
            function(actionEntry) {
                let state = actionEntry.state;
                let parameterType = actionEntry.parameter_type ?
                    GLib.VariantType.new(actionEntry.parameter_type) : null;
                let action;

                if (state)
                    action = Gio.SimpleAction.new_stateful(actionEntry.name,
                        parameterType, actionEntry.state);
                else
                    action = new Gio.SimpleAction({ name: actionEntry.name });

                if (actionEntry.create_hook)
                    actionEntry.create_hook.apply(this, [action]);

                if (actionEntry.callback)
                    action.connect('activate', Lang.bind(this, actionEntry.callback));

                if (actionEntry.accel)
                    this.add_accelerator(actionEntry.accel, 'app.' + actionEntry.name, null);

                if (actionEntry.accels)
                    this.set_accels_for_action('app.' + actionEntry.name, actionEntry.accels);

                this.add_action(action);
            }));
    },

    _connectActionsToMode: function() {
        this._actionEntries.forEach(Lang.bind(this,
            function(actionEntry) {
                if (actionEntry.window_mode) {
                    modeController.connect('window-mode-changed', Lang.bind(this,
                        function() {
                            let mode = modeController.getWindowMode();
                            let action = this.lookup_action(actionEntry.name);
                            action.set_enabled(mode == actionEntry.window_mode);
                        }));
                }
            }));
    },

    vfunc_startup: function() {
        this.parent();
        String.prototype.format = Format.format;

        application = this;
        settings = new Gio.Settings({ schema: 'org.gnome.books' });

        this._actionEntries = [
            { name: 'quit',
              callback: this._onActionQuit,
              accel: '<Primary>q' }
        ];

        this._initActions();
    },

    vfunc_shutdown: function() {
        this.parent();
    },

    _createWindow: function() {
        if (this._mainWindow)
            return;

        this._mainWindow = new MainWindow.MainWindow(this);
        this._mainWindow.window.connect('destroy', Lang.bind(this, this._onWindowDestroy));
        this._connectActionsToMode();
    },

    vfunc_dbus_register: function(connection, path) {
        this.parent(connection, path);
        return true;
    },

    vfunc_dbus_unregister: function(connection, path) {
        this.parent(connection, path);
    },

    vfunc_activate: function() {
        if (!this._mainWindow)
            this._createWindow();
    },

    _onWindowDestroy: function(window) {
        this._mainWindow = null;
    }
});

Utils.addSignalMethods(Application.prototype);