imports.gi.versions.Gtk = '3.0';
imports.gi.versions.WebKit2 = '3.0';

const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Gdk = imports.gi.Gdk;
const GLib = imports.gi.GLib;
const WebKit = imports.gi.WebKit2;
const Lang = imports.lang;
const Gb = imports.gi.Gb;

const Utils = imports.utils;

const _PREVIEW_NAVBAR_MARGIN = 30;
const _AUTO_HIDE_TIMEOUT = 2;

const WebView = new Lang.Class ({
    Name: 'WebView',

    _init: function (app, overlay) {
        this.view = this._initView(app, overlay);
    },

    _initView: function(app, overlay) {

        this._overlay = overlay;
        var hbox = new Gtk.Box ({orientation: Gtk.Orientation.VERTICAL, spacing: 5});

        this.loadButton = new Gtk.Button ({label: 'Load Book'});

        // WebKit preview
        this.web_view = new Gb.WebView();
        this.web_view.register_URI (this.web_view);

        this.loadButton.connect("clicked", Lang.bind (this, function () {
            this.web_view.run_JS ("var Book = ePub('/epub.js/reader/moby-dick/', { width: 1076, height: 588 });");
            this.web_view.run_JS ("var rendered = Book.renderTo('area').then(function(){});");
        }));

        let view = this.web_view.get_view();
        // Settings
        let s = view.get_settings();
        s.enable_javascript = true;
        s.auto_load_images = true;
        s.enable_fullscreen = true;
        s.enable_developer_extras = true;
        s.enable_xss_auditor = false;
        view.set_settings(s);

        hbox.pack_start (view, true, true, 0);
        hbox.pack_start (this.loadButton, false, false, 0);
        this._overlay.add(hbox);

        this.prev_widget = new Gtk.Button({ child: new Gtk.Image ({ icon_name: 'go-previous-symbolic',
                                                                    pixel_size: 16 }),
                                            margin_left: _PREVIEW_NAVBAR_MARGIN,
                                            margin_right: _PREVIEW_NAVBAR_MARGIN,
                                            halign: Gtk.Align.START,
                                            valign: Gtk.Align.CENTER });
        this.prev_widget.get_style_context().add_class('osd');
        this._overlay.add_overlay(this.prev_widget);
        this.prev_widget.connect('clicked', Lang.bind(this, this._onPrevClicked));

        this.next_widget = new Gtk.Button({ child: new Gtk.Image ({ icon_name: 'go-next-symbolic',
                                                                    pixel_size: 16 }),
                                            margin_left: _PREVIEW_NAVBAR_MARGIN,
                                            margin_right: _PREVIEW_NAVBAR_MARGIN,
                                            halign: Gtk.Align.END,
                                            valign: Gtk.Align.CENTER });
        this.next_widget.get_style_context().add_class('osd');
        this._overlay.add_overlay(this.next_widget);
        this.next_widget.connect('clicked', Lang.bind(this, this._onNextClicked));

        this._overlay.show_all();
        this._overlay.connect('motion-notify-event', Lang.bind(this, this._onMotion));
    },

    _onPrevClicked: function() {
        this.web_view.run_JS("Book.prevPage();");
    },

    _onNextClicked: function() {
        this.web_view.run_JS ("Book.nextPage();")
    },

    _onMotion: function() {
        if (this._motionId != 0) {
            return false;
        }

        this._motionId = Mainloop.idle_add(Lang.bind(this, this._motionTimeout));
        return false;
    },
});