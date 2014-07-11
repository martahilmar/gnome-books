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
    win.set_title('GNOME Books');
    win.connect("delete-event", function() { 
        Gtk.main_quit();
    });

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
    //let start_uri = "http://localhost:8080/examples/pagination.html"; 
    this.web_view = new Gb.WebView();
    this.web_view.register_URI();

    let view = this.web_view.get_view();
    
    view.connect('close', function() {
        win.destroy();
    });

    //view.load_uri(start_uri);
    sw.add(view);

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