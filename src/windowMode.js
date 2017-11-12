/*
 * Copyright (c) 2011 Red Hat, Inc.
 *
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
 * Author: Cosimo Cecchi <cosimoc@redhat.com>
 *
 */

const Gdk = imports.gi.Gdk;

const Lang = imports.lang;
const Signals = imports.signals;

const Application = imports.application;

var WindowMode = {
    NONE: 0,
    OVERVIEW: 1,
    READ_VIEW: 2
};

var ModeController = new Lang.Class({
    Name: 'ModeController',

    _init: function() {
        this._mode = WindowMode.NONE;
        this._fullscreen = false;
        this._canFullscreen = false;
    },

    setWindowMode: function(mode) {
        let oldMode = this._mode;
 
        if (oldMode == mode)
            return;

        if (mode == WindowMode.READ) {
            this.setCanFullscreen(true);
        } else {
            this.setCanFullscreen(false);
        }

        this._mode = mode;

        this.emit('window-mode-changed', this._mode, oldMode);
    },

    getWindowMode: function() {
        return this._mode;
    },

    setCanFullscreen: function(canFullscreen) {
        this._canFullscreen = canFullscreen;

        if (!this._canFullscreen && this._fullscreen)
            this.setFullscreen(false);

        this.emit('can-fullscreen-changed');
    },

    setFullscreen: function(fullscreen) {
        if (this._mode != WindowMode.READ)
            return;

        if (this._fullscreen == fullscreen)
            return;

        if (fullscreen && !this._canFullscreen)
            return;

        this._fullscreen = fullscreen;
        this.emit('fullscreen-changed', this._fullscreen);
    },

    toggleFullscreen: function() {
        this.setFullscreen(!this._fullscreen);
    },

    getFullscreen: function() {
        return this._fullscreen;
    },

    getCanFullscreen: function() {
        return this._canFullscreen;
    }
});
Signals.addSignalMethods(ModeController.prototype);
