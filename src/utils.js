/*
 * Copyright (c) 2011 Red Hat, Inc.
 *
 * Gnome Books is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by the
 * Free Software Foundation; either version 2 of the License, or (at your
 * option) any later version.
 *
 * Gnome Books is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with Gnome Books; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 *
 * Author: Cosimo Cecchi <cosimoc@redhat.com>
 *
 */

const Gdk = imports.gi.Gdk;
const Gd = imports.gi.Gd;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Gtk = imports.gi.Gtk;

const Application = imports.application;

const Lang = imports.lang;
const Signals = imports.signals;

const _ICON_VIEW_SIZE = 128;
const _LIST_VIEW_SIZE = 48;

let debugInit = false;
let debugEnabled = false;

let _iconStore = {};

function getIconSize() {
    let viewType = Application.settings.get_enum('view-as');

    if (viewType == Gd.MainViewType.LIST)
        return _LIST_VIEW_SIZE;
    else
        return _ICON_VIEW_SIZE;
}

function getThumbnailFrameBorder() {
    let viewType = Application.settings.get_enum('view-as');
    let slice = new Gtk.Border();
    let border = null;

    slice.top = 3;
    slice.right = 3;
    slice.bottom = 6;
    slice.left = 4;

    if (viewType == Gd.MainViewType.LIST) {
        border = new Gtk.Border();
        border.top = 1;
        border.right = 1;
        border.bottom = 3;
        border.left = 2;
    } else {
        border = slice.copy();
    }

    return [ slice, border ];
}

function debug(str) {
    if (!debugInit) {
        let env = GLib.getenv('BOOKS_DEBUG');
        if (env)
            debugEnabled = true;

        debugInit = true;
    }

    if (debugEnabled)
        log('DEBUG: ' + str);
}

// Connect to a signal on an object and disconnect on its first emission.
function once(obj, signal, callback) {
    let id = obj.connect(signal, function() {
        obj.disconnect(id);
        callback();
    });
}

function addSignalMethods(proto) {
    Signals.addSignalMethods(proto);
    proto.once = once.bind(undefined, proto);
}

function initActions(actionMap, simpleActionEntries, context) {
    simpleActionEntries.forEach(function(entry) {
        let action = new Gio.SimpleAction(entry.properties);

        for(let signalHandler in entry.signalHandlers) {
            let callback = entry.signalHandlers[signalHandler];
            action.connect(signalHandler, callback.bind(context));
        }

        actionMap.add_action(action);
    });
}

function getUIObject(res, ids) {
    let builder = new Gtk.Builder();
    builder.add_from_resource('/org/gnome/books/' + res + '.ui');
    let ret = {};
    ids.forEach(function(id) {
        ret[dashedToCamelCase(id)] = builder.get_object(id);
    });
    return ret;
}

function loadStyleSheet(file) {
    let provider = new Gtk.CssProvider();
    provider.load_from_file(file);
    Gtk.StyleContext.add_provider_for_screen(Gdk.Screen.get_default(),
                                             provider,
                                             Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION);
}