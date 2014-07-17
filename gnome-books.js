#!/usr/bin/gjs

imports.gi.versions.Gtk = '3.0';
imports.gi.versions.WebKit2 = '3.0';

const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Gdk = imports.gi.Gdk;
const GLib = imports.gi.GLib;
const WebKit = imports.gi.WebKit2;
const Lang = imports.lang;
const Gb = imports.gi.Gb;

function Demo() {
    this._init();
}

Demo.prototype = {

  _init: function () {
    this.setupWindow ();
  },

  setupWindow: function() {
    let win = new Gtk.Window();
    this._cancellable = new Gio.Cancellable();

    win.set_title('GNOME Books');
    win.connect("delete-event", function() { 
        Gtk.main_quit();
    });

    var box = new Gtk.Box ({orientation: Gtk.Orientation.VERTICAL, spacing: 5});
    var hbox = new Gtk.Box ({orientation: Gtk.Orientation.HORIZONTAL, spacing: 5});
    var vbox = new Gtk.Box ({orientation: Gtk.Orientation.VERTICAL, spacing: 5});
    
    this.prevButton = new Gtk.Button ({label: '<'});
    this.nextButton = new Gtk.Button ({label: '>'});
    this.loadButton = new Gtk.Button ({label: 'Load Book'});

    // Fullscreen mode
    let isFullscreen = false;
    let accel_group = new Gtk.AccelGroup();
    accel_group.connect(Gdk.KEY_F11, 0, Gtk.AccelFlags.VISIBLE, function() {
        if(isFullscreen)
            win.unfullscreen();
        else
            win.fullscreen();
        isFullscreen = !isFullscreen;
    });
    win.add_accel_group(accel_group);

    let sw = new Gtk.ScrolledWindow({});
    win.add(sw);

    // WebKit preview
    this.web_view = new Gb.WebView();
    this.web_view.register_URI (this.web_view);

    this.loadButton.connect("clicked", Lang.bind (this, function () {
        this.web_view.run_JS ("var Book = ePub('/epub.js/reader/moby-dick/', { width: 1076, height: 588 });");
        this.web_view.run_JS ("var rendered = Book.renderTo('area').then(function(){});");
    }));

    this.prevButton.connect("clicked", Lang.bind (this, function () {
        this.web_view.run_JS("Book.prevPage();");
    }));

    this.nextButton.connect("clicked", Lang.bind (this, function () {
        this.web_view.run_JS ("Book.nextPage();")
    }));

    let view = this.web_view.get_view();
    
    view.connect('close', function() {
        win.destroy();
    });

    hbox.pack_start (this.prevButton, false, false, 0);
    hbox.pack_start (view, true, true, 0);
    hbox.pack_start (this.nextButton, false, false, 0);
    vbox.pack_start (this.loadButton, false, false, 0);
    box.pack_start (hbox, true, true, 0);
    box.pack_start (vbox, false, false, 0);

    //sw.add(view);
    sw.add(box);

    view.grab_focus();

    // view.get_inspector().show();
    view.get_inspector().connect('attach', function(ins, data) { 
        win.set_size_request(1340, 768 + ins.get_attached_height());
    });

    // Settings
    let s = view.get_settings();
    s.enable_javascript = true;
    s.auto_load_images = true;         // Temporary
    s.enable_fullscreen = true;
    s.enable_developer_extras = true;
    s.enable_xss_auditor = false;
    view.set_settings(s);

    win.set_size_request(1340, 768);
    win.set_position(Gtk.WindowPosition.CENTER);
    win.show_all();
  }
}

Gtk.init (null, null);
var demo = new Demo ();
Gtk.main ();