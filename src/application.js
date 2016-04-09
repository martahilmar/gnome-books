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
const Signals = imports.signals;
const Gettext = imports.gettext;
const _ = imports.gettext.gettext;

// Import versions go here
imports.gi.versions.WebKit = '4.0';
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
const WindowMode = imports.windowMode;
const Library = imports.library;
const BaseManager = imports.manager;

// used globally
let application = null;

// used by the application, but not by the search provider
let modeController = null;
let settings = null;
let cssProvider = null;
let library = null;
let webView = null;
let baseManager = null;

const Application = new Lang.Class({
    Name: 'Application',
    Extends: Gtk.Application,

    _init: function() {
        this._activationTimestamp = Gdk.CURRENT_TIME;

        Gettext.bindtextdomain('gnome-books', Path.LOCALE_DIR);
        Gettext.textdomain('gnome-books');
        GLib.set_prgname('gnome-books');
        GLib.set_application_name(_("Books"));

        this.parent({ application_id: 'org.gnome.Books',
                      inactivity_timeout: 12000 });
    },

    _onActionQuit: function() {
        this._mainWindow.window.destroy();
    },

    _onActionAbout: function() {
        this._mainWindow.showAbout();
    },

    _onActionToggle: function(action) {
        let state = action.get_state();
        action.change_state(GLib.Variant.new('b', !state.get_boolean()));
    },

    _onActionViewAs: function(action, parameter) {
        if (parameter.get_string()[0] != action.state.get_string()[0])
            settings.set_value('view-as', parameter);
    },

    _viewAsCreateHook: function(action) {
        settings.connect('changed::view-as', Lang.bind(this,
            function() {
                let state = settings.get_value('view-as');
                if (state.get_string()[0] != action.state.get_string()[0])
                    action.state = state;
            }));
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

    _initAppMenu: function() {
        let builder = new Gtk.Builder();
        builder.add_from_resource('/org/gnome/books/app-menu.ui');

        let menu = builder.get_object('app-menu');
        this.set_app_menu(menu);
    },

    _themeChanged: function(gtkSettings) {
        let screen = Gdk.Screen.get_default();

        if (gtkSettings.gtk_theme_name == 'Adwaita') {
            if (cssProvider == null) {
                cssProvider = new Gtk.CssProvider();
                let file = Gio.File.new_for_uri("resource:///org/gnome/books/Adwaita.css");
                cssProvider.load_from_file(file);
            }

            Gtk.StyleContext.add_provider_for_screen(screen,
                                                     cssProvider,
                                                     Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
        } else if (cssProvider != null) {
            Gtk.StyleContext.remove_provider_for_screen(screen, cssProvider);
        }
    },

    vfunc_startup: function() {
        this.parent();
        String.prototype.format = Format.format;

        let resource = Gio.Resource.load(Path.RESOURCE_DIR + '/gnome-books.gresource');
        resource._register();

        application = this;
        settings = new Gio.Settings ({ schema: 'org.gnome.books' });
        this.ensure_directory();

        let gtkSettings = Gtk.Settings.get_default();
        gtkSettings.connect('notify::gtk-theme-name', Lang.bind(this, this._themeChanged));
        this._themeChanged(gtkSettings);

        modeController = new WindowMode.ModeController();
        library = new Library.Library();
        baseManager = new BaseManager.BaseManager();

        // WebKit preview
        webView = new GbPrivate.WebView();
        webView.register_URI(webView);

        this._actionEntries = [
            { name: 'quit',
              callback: this._onActionQuit,
              accel: '<Primary>q' },
            { name: 'about',
              callback: this._onActionAbout },
            { name: 'gear-menu',
              callback: this._onActionToggle,
              state: GLib.Variant.new('b', false),
              accel: 'F10',
              window_mode: WindowMode.WindowMode.READ_VIEW },
            { name: 'view-as',
              callback: this._onActionViewAs,
              create_hook: this._viewAsCreateHook,
              parameter_type: 's',
              state: settings.get_value('view-as'),
              window_mode: WindowMode.WindowMode.OVERVIEW },
            { name: 'properties',
              window_mode: WindowMode.WindowMode.READ_VIEW },
            { name: 'show-contents'}
        ];

        this._initActions();
        this._initAppMenu();
    },

    vfunc_shutdown: function() {
        this.parent();
    },

    ensure_directory: function() {
        /* Translators: "Recordings" here refers to the name of the directory where the application places files */
        let path = GLib.build_filenamev([GLib.get_home_dir(), _("Books")]);

        // Ensure Recordings directory
        GLib.mkdir_with_parents(path, parseInt("0755", 8));
        this.saveDir = Gio.file_new_for_path(path);
    },

    _createWindow: function() {
        if (this._mainWindow)
            return;

        this._connectActionsToMode();
        this._mainWindow = new MainWindow.MainWindow(this);
        this.emit("window-created");

        this._mainWindow.window.connect('destroy', Lang.bind(this, this._onWindowDestroy));
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
        {
            this._createWindow();
            modeController.setWindowMode(WindowMode.WindowMode.OVERVIEW);
        }

        this._mainWindow.window.present_with_time(this._activationTimestamp);
        this._activationTimestamp = Gdk.CURRENT_TIME;
    },

    _clearState: function() {
        // clean up signals
        modeController.disconnectAll();
        library.disconnectAll();

        // reset state
        modeController.setWindowMode(WindowMode.WindowMode.NONE);
    },

    _onWindowDestroy: function(window) {
        this._mainWindow = null;
        Mainloop.idle_add(Lang.bind(this, this._clearState));
    },

    getScaleFactor: function() {
        return this._mainWindow.window.get_scale_factor();
    },

    getGdkWindow: function() {
        return this._mainWindow.window.get_window();
    },

    getWebView: function() {
        return webView;
    }
});

Utils.addSignalMethods(Application.prototype);
