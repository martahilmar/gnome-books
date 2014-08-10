imports.gi.versions.Gtk = '3.0';
imports.gi.versions.WebKit2 = '3.0';

const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Gdk = imports.gi.Gdk;
const GLib = imports.gi.GLib;
const WebKit = imports.gi.WebKit2;

const Lang = imports.lang;
const Mainloop = imports.mainloop;

const Application = imports.application;

const ContentsDialog = new Lang.Class({
    Name: 'ContentsDialog',

    _init: function(contents) {
        this._createWindow(contents);
        this.widget.show_all();
    },

    _createWindow: function(contents) {
        this._contents = contents;

        let toplevel = Application.application.get_windows()[0];
        this.widget = new Gtk.Dialog ({ resizable: true,
                                        transient_for: toplevel,
                                        modal: true,
                                        destroy_with_parent: true,
                                        use_header_bar: true,
                                        default_width: 600, // FIXME use toplevel size
                                        default_height: 600,
                                        title: "",
                                        hexpand: true });

        this._contentArea = this.widget.get_content_area();
        this._stack = new Gtk.Stack({ border_width: 5,
                                      homogeneous: true });
        this._contentArea.pack_start(this._stack, true, true, 0);

        //let header = this.widget.get_header_bar();
        let switcher = new Gtk.StackSwitcher({ stack: this._stack });

        //header.set_custom_title(switcher);

        let link = this._contents.split("%");

        this._handleLink(link);
        //this._addPage(this._linksPage);
    },

    _handleLink: function(link) {
        link.forEach(Lang.bind(this,
            function(value) {
                this._message = new Gtk.Label ({label: value});
                this._contentArea.add (this._message);
            }));
    },

    _gotoDest: function(dest) {
    },

    _addPage: function(widget) {
        this._stack.add_titled(widget, widget.name, widget.name);
    }
});
