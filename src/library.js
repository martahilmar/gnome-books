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

const Cairo = imports.gi.cairo;
const Gd = imports.gi.Gd;
const Gdk = imports.gi.Gdk;
const GdkPixbuf = imports.gi.GdkPixbuf;
const Gettext = imports.gettext;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const _ = imports.gettext.gettext;

const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Signals = imports.signals;

const Application = imports.application;
const WindowMode = imports.windowMode;
const Utils = imports.utils;

var Library = new Lang.Class({
	Name: 'Library',

	_init: function() {
        Application.application.connect('window-created', Lang.bind(this, this._loadIcon));
	},

	_loadIcon: function () {
        this.surface = null;
        this._items = {};

        let libraryPath = Gio.File.new_for_path (GLib.get_home_dir() + "/Books/");
        let libEnum = libraryPath.enumerate_children (Gio.FILE_ATTRIBUTE_STANDARD_NAME, 0, null);
        this.id = 0;

        this.fileInfo = libEnum.next_file(null);
        while(this.fileInfo != null && 
            (this.fileInfo.get_name().substring(this.fileInfo.get_name().length - 4, this.fileInfo.get_name().lengh)) == "epub")
        {
        	let item = null;
            this.path = GLib.get_home_dir() + "/Books/" + this.fileInfo.get_name();
            let thumnailPath = this.path.substring(0, this.path.length - 5) + ".jpg";

            GLib.spawn_command_line_sync("epub-thumbnailer.py " + this.path + " " + thumnailPath + " 200");
            this.pixbuf = GdkPixbuf.Pixbuf.new_from_file(thumnailPath);
            let thumbnailedPixbuf = null;

            if (thumnailPath) {
                let [ slice, border ] = Utils.getThumbnailFrameBorder();
                thumbnailedPixbuf = Gd.embed_image_in_frame(this.pixbuf,
                    'resource:///org/gnome/books/thumbnail-frame.png',
                    slice, border);
            } else {
                thumbnailedPixbuf = this.pixbuf;
            }

            this.surface = Gdk.cairo_surface_create_from_pixbuf(thumbnailedPixbuf,
                Application.application.getScaleFactor(),
                Application.application.getGdkWindow());

            let [otitle, title] = GLib.spawn_command_line_sync("epub-metadata.py " + this.path + " getTitle()");
            let [oauthor, author] = GLib.spawn_command_line_sync("epub-metadata.py " + this.path + " getAuthor()");

            item = { icon: this.surface,
                     epubName: this.fileInfo.get_name(),
            		 title: title.toString(),
                     author: author.toString(),
            		 path: this.path,
                     id: this.id };

            this._items[this.id] = item;
            this.id = this.id + 1;

            GLib.spawn_command_line_sync("rm -r " + thumnailPath);
            this.fileInfo = libEnum.next_file(null);
        }

        this.emit('items-added', this._items);
	}
});
Signals.addSignalMethods(Library.prototype);

