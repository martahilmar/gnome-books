/*
 * Copyright (c) 2011 Red Hat, Inc.
 *
 * Gnome Documents is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by the
 * Free Software Foundation; either version 2 of the License, or (at your
 * option) any later version.
 *
 * Gnome Documents is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with Gnome Documents; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 *
 * Author: Cosimo Cecchi <cosimoc@redhat.com>
 *
 */

const Gdk = imports.gi.Gdk;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Pango = imports.gi.Pango;

const Lang = imports.lang;
const Signals = imports.signals;

const BaseManager = new Lang.Class({
    Name: 'BaseManager',

    _init: function(title, actionId, context) {
        this._items = {};
        this._activeItem = null;
        this._title = null;
        this._actionId = null;

        if (title)
            this._title = title;

        if (actionId)
            this._actionId = actionId;

        this.context = context;
    },

    getActionId: function() {
        return this._actionId;
    },

    getTitle: function() {
        return this._title;
    },

    getItemById: function(id) {
        let retval = this._items[id];

        if (!retval)
            retval = null;

        return retval;
    },

    addItem: function(item) {
        item._manager = this;

        let oldItem = this._items[item.id];
        if (oldItem)
            this.removeItem(oldItem);

        this._items[item.id] = item;
        //this.emit('item-added', item);
    },

    setActiveItem: function(item) {
        this._activeItem = item;
        this.emit('active-changed', this._activeItem);

        return true;
    },

    setActiveItemById: function(id) {
        let item = this.getItemById(id);
        return this.setActiveItem(item);
    },

    getItems: function() {
        return this._items;
    },

    getItemsCount: function() {
        return Object.keys(this._items).length;
    },

    getActiveItem: function() {
        return this._activeItem;
    },

    removeItem: function(item) {
        this.removeItemById(item.id);
    },

    removeItemById: function(id) {
        let item = this._items[id];

        if (item) {
            delete this._items[id];
            this.emit('item-removed', item);
            item._manager = null;
        }
    }
});
Signals.addSignalMethods(BaseManager.prototype);