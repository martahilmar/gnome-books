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
 
imports.gi.versions.Gtk = '3.0';
imports.gi.versions.WebKit2 = '3.0';

const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const Gdk = imports.gi.Gdk;
const GLib = imports.gi.GLib;
const WebKit = imports.gi.WebKit2;

const Lang = imports.lang;
const Mainloop = imports.mainloop;
const Tweener = imports.tweener.tweener;

const Application = imports.application;
const Contents = imports.contents;
const GbPrivate = imports.gi.GbPrivate;

const WebView = new Lang.Class ({
    Name: 'WebView',

    _init: function (app, overlay) {
        this.view = this._initView(app, overlay);
    },

    _initView: function(app, overlay) {

        this._overlay = overlay;
        this._bookLoaded = false;
        //this._grid = new Gtk.Grid();

        var hbox = new Gtk.Box ({orientation: Gtk.Orientation.VERTICAL, spacing: 5});
        var vbox = new Gtk.Box ({orientation: Gtk.Orientation.HORIZONTAL, spacing: 5});

        this._loadBookButton = new Gtk.Button ({label: 'Load Book'});
        this._loadTocButton = new Gtk.Button ({label: 'Load Table of Contents'});
        this._loadTotalPageNum = new Gtk.Button ({label: 'Load Page Number'});
        this._openBook = new Gtk.Button ({label: "Open a book"});
        
        // WebKit preview
        this._webView = new GbPrivate.WebView();
        this._webView.register_URI (this._webView);

        this._loadBookButton.connect("clicked", Lang.bind (this, function () {
            //this._onLoadBook('/epub.js/reader/moby-dick/');
        }));

        this._loadTocButton.connect("clicked", Lang.bind (this, function () {
            this._onLoadPagination ();
        }));

        this._loadTotalPageNum.connect("clicked", Lang.bind(this, function () {
            this._onLoadTotalPageNum ();
        }));

        this._openBook.connect("clicked", Lang.bind (this, this._openBookClicked));

        let view = this._webView.get_view();
        // Settings
        let s = view.get_settings();
        s.enable_javascript = true;
        s.auto_load_images = true;
        s.enable_fullscreen = true;
        s.enable_developer_extras = true;
        s.enable_xss_auditor = false;
        view.set_settings(s);

        this.bar_widget = new GbPrivate.NavBar({ margin: _PREVIEW_NAVBAR_MARGIN,
                                                 valign: Gtk.Align.END,
                                                 opacity: 0 });

        this._navControls = new ReadNavControls(this._webView, this._overlay, this.bar_widget);

        let showContents = Application.application.lookup_action('show-contents');
        showContents.connect('activate', Lang.bind(this, this._showContents));

        //this._grid.attach (view, 0, 0, 1, 1);
        //this._grid.attach (this.loadButton, 0, 1, 1, 1);
        vbox.pack_start (this._openBook, true, true, 0);
        //vbox.pack_start (this._loadBookButton, true, true, 0);
        vbox.pack_start (this._loadTocButton, true, true, 0);
        vbox.pack_start (this._loadTotalPageNum, true, true, 0);
        hbox.pack_start (vbox, false, false, 0);
        hbox.pack_start (view, true, true, 0);
        vbox.set_homogeneous(true);
        this._overlay.add(hbox);

        this._overlay.show_all();
    },

    _onLoadBook: function(path) {
        if (!this._bookLoaded)
        {
            this._bookLoaded = true;
            this._webView.run_JS ("var Book = ePub('" + path + "', { width: 1076, height: 588 });");
            this._webView.run_JS ("var rendered = Book.renderTo('area');");
            // Load Table of Contents
            this._webView.run_JS ("Book.getToc().then(function(toc) {                               \
                                        toc.forEach(function(chapter) {                             \
                                            chapters += '%' + chapter.label + '=' + chapter.href;   \
                                        }); });"); 
        }
    },

    _onLoadPagination: function() {
        this._webView.run_JS ("Book.ready.all.then(function(){ Book.generatePagination();           \
                                Book.pageListReady.then(function(pageList) {                        \
                                    $('.notify-bar').show().addClass('notify-bar-height-change');   \
                                    setTimeout(function () { $('.notify-bar').hide(); }, 3000);     \
                                  }); });");
        /*
        this._webView.run_JS_return("function x() { Book.pageListReady.then(function()   \
                                        { return 'true' }); }; x();", Lang.bind(this, 
            function(src, res) {
                var output = this._webView.output_JS_finish(res);
                log("----- JS output: " + output)
            }));
        */
    },

    _onLoadTotalPageNum: function() {
        this._webView.run_JS_return ("(Book.pagination.totalPages).toString();", Lang.bind(this,
            function(src, res) {
                var n_pages = this._webView.output_JS_finish(res);
                this.bar_widget.set_total_pages(n_pages);
                this.bar_widget.set_current_page(1);
                this._navControls.show();
            }));
    },

    _showContents: function() {
        let toc;
        this._webView.run_JS_return("function x() { return chapters } x();", Lang.bind(this,
            function(src, res) {
                toc = this._webView.output_JS_finish(res);

                let dialog = new Contents.ContentsDialog(toc, this._navControls);
                dialog.widget.connect('response', Lang.bind(this,
                    function(widget, response) {
                        widget.destroy();
                    }));
            }));
    },

    _openBookClicked: function () {
        var chooser = new Gtk.FileChooserDialog ({title: "Select a book",
                                              action: Gtk.FileChooserAction.OPEN,
                                              modal: true});
        chooser.add_button (Gtk.STOCK_CANCEL, 0);
        chooser.add_button (Gtk.STOCK_OPEN, 1);
        chooser.set_default_response (1);
        
        if (chooser.run () == 1)
        {
            var path = (chooser.get_uri ()).split("file://").pop();
            path += "/";
            this._onLoadBook(path);
            log(path);
        }
        
        chooser.destroy ();
    }
});

const _PREVIEW_NAVBAR_MARGIN = 30;
const _AUTO_HIDE_TIMEOUT = 2;

const ReadNavControls = new Lang.Class({
    Name: 'ReadNavControls',

    _init: function(webView, overlay, barWidget) {
        // Create the horizontal scale
        this._overlay = overlay;
        this._webView = webView;
        this.bar_widget = barWidget;

        this._visible = false;
        this._autoHideId = 0;
        this._motionId = 0;
        this._hover = false;

        this.bar_widget.get_style_context().add_class('osd');
        this._overlay.add_overlay(this.bar_widget);
        this.bar_widget.connect('notify::scale-changed', Lang.bind (this, this._onUpdatePage))
        
        this.bar_widget.connect('notify::hover', Lang.bind(this, function() {
            if (this.bar_widget.hover)
                this._onEnterNotify();
            else
                this._onLeaveNotify();
        }));

        let buttonArea = this.bar_widget.get_button_area();

        let tocButton = new Gtk.Button({ action_name: 'app.show-contents', 
                                         child: new Gtk.Image({ icon_name: 'view-list-symbolic',
                                                             pixel_size: 16 }),
                                         valign: Gtk.Align.CENTER,
                                         tooltip_text: ("Contents")
                                       });
        buttonArea.pack_start(tocButton, false, false, 0);

        let button = new Gtk.ToggleButton({ action_name: 'app.bookmark-page',
                                            child: new Gtk.Image({ icon_name: 'bookmark-add-symbolic',
                                                               pixel_size: 16 }),
                                            valign: Gtk.Align.CENTER,
                                            tooltip_text: ("Bookmark this page")
                                      });
        buttonArea.pack_start(button, false, false, 0);

        this.prev_widget = new Gtk.Button({ child: new Gtk.Image ({ icon_name: 'go-previous-symbolic',
                                                                    pixel_size: 16 }),
                                            margin_left: _PREVIEW_NAVBAR_MARGIN,
                                            margin_right: _PREVIEW_NAVBAR_MARGIN,
                                            halign: Gtk.Align.START,
                                            valign: Gtk.Align.CENTER });
        this.prev_widget.get_style_context().add_class('osd');
        this._overlay.add_overlay(this.prev_widget);
        this.prev_widget.connect('clicked', Lang.bind(this, this._onPrevClicked));
        this.prev_widget.connect('enter-notify-event', Lang.bind(this, this._onEnterNotify));
        this.prev_widget.connect('leave-notify-event', Lang.bind(this, this._onLeaveNotify));

        this.next_widget = new Gtk.Button({ child: new Gtk.Image ({ icon_name: 'go-next-symbolic',
                                                                    pixel_size: 16 }),
                                            margin_left: _PREVIEW_NAVBAR_MARGIN,
                                            margin_right: _PREVIEW_NAVBAR_MARGIN,
                                            halign: Gtk.Align.END,
                                            valign: Gtk.Align.CENTER });
        this.next_widget.get_style_context().add_class('osd');
        this._overlay.add_overlay(this.next_widget);
        this.next_widget.connect('clicked', Lang.bind(this, this._onNextClicked));
        this.next_widget.connect('enter-notify-event', Lang.bind(this, this._onEnterNotify));
        this.next_widget.connect('leave-notify-event', Lang.bind(this, this._onLeaveNotify));

        this._overlay.connect('motion-notify-event', Lang.bind(this, this._onMotion))
        
        this._webView.connect('move-cursor', Lang.bind(this,
            function(widget, link) {
                this._onMotion();
            }));
    },

    _onEnterNotify: function() {
        this._hover = true;
        this._unqueueAutoHide();
        return false;
    },

    _onLeaveNotify: function() {
        this._hover = false;
        this._queueAutoHide();
        return false;
    },

    _motionTimeout: function() {
        this._motionId = 0;
        this._updateVisibility();
        return false;
    },

    _onMotion: function() {
        if (this._motionId != 0) {
            return false;
        }

        this._motionId = Mainloop.idle_add(Lang.bind(this, this._motionTimeout));
        return false;
    },

    _autoHide: function() {
        this._fadeOutButton(this.bar_widget);
        this._fadeOutButton(this.prev_widget);
        this._fadeOutButton(this.next_widget);
        this._autoHideId = 0;
        return false;
    },

    _unqueueAutoHide: function() {
        if (this._autoHideId == 0)
            return;

        Mainloop.source_remove(this._autoHideId);
        this._autoHideId = 0;
    },

    _queueAutoHide: function() {
        this._unqueueAutoHide();
        this._autoHideId = Mainloop.timeout_add_seconds(_AUTO_HIDE_TIMEOUT, Lang.bind(this, this._autoHide));
    },

    _updateVisibility: function() {
        var c_page = this.bar_widget.get_current_page();
        var n_pages = this.bar_widget.get_total_pages();

        if (!this._visible) {
            this._fadeOutButton(this.bar_widget);
            this._fadeOutButton(this.prev_widget);
            this._fadeOutButton(this.next_widget);
            return;
        }

        this._fadeInButton(this.bar_widget);

        if (c_page > 1)
            this._fadeInButton(this.prev_widget);
        else
            this._fadeOutButton(this.prev_widget);

        if (n_pages > c_page + 1)
            this._fadeInButton(this.next_widget);
        else
        this._fadeOutButton(this.next_widget);

        if (!this._hover)
            this._queueAutoHide();
        
    },

    _fadeInButton: function(widget) {
        widget.show_all();
        Tweener.addTween(widget, { opacity: 1,
                                   time: 0.30,
                                   transition: 'easeOutQuad' });
    },

    _fadeOutButton: function(widget) {
        Tweener.addTween(widget, { opacity: 0,
                                   time: 0.30,
                                   transition: 'easeOutQuad',
                                   onComplete: function() {
                                       widget.hide();
                                   },
                                   onCompleteScope: this });
    },

    show: function() {
        this._visible = true;
        this._updateVisibility();
    },

    hide: function() {
        this._visible = false;
        this._updateVisibility();
    },

    _onPrevClicked: function() {
        var c_page = this.bar_widget.get_current_page();

        if(c_page > 1)
        {
            this._webView.run_JS("Book.prevPage();");
            this.bar_widget.update_page(c_page - 1);
        }
    },

    _onNextClicked: function() {
        var c_page = this.bar_widget.get_current_page();
        var n_pages = this.bar_widget.get_total_pages();
        if(c_page + 1 < n_pages || n_pages == 0)
        {
            this._webView.run_JS ("Book.nextPage();");
            this.bar_widget.update_page(c_page + 1);
        }
    },

    _onUpdatePage: function() {
        var c_page = this.bar_widget.get_current_page();
        this._webView.run_JS("Book.gotoPage(" + c_page + ");");
    },

    handleLink: function(link) {
        this._webView.run_JS ("Book.goto('" + link + "');");
        this._webView.run_JS ("var currentLocation = Book.getCurrentLocationCfi();");
        this._webView.run_JS_return ("(Book.pagination.pageFromCfi(currentLocation)).toString();", Lang.bind(this,
            function(src, res) {
                var page = this._webView.output_JS_finish(res);
                this.bar_widget.update_page(page);
            }));
    }
});