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

const GbPrivate = imports.gi.GbPrivate;

const _PREVIEW_NAVBAR_MARGIN = 30;
const _AUTO_HIDE_TIMEOUT = 2;

const WebView = new Lang.Class ({
    Name: 'WebView',

    _init: function (app, overlay) {
        this.view = this._initView(app, overlay);
    },

    _initView: function(app, overlay) {

        this._overlay = overlay;

        this._visible = false;
        this._autoHideId = 0;
        this._motionId = 0;
        this._hover = false;

        //this._grid = new Gtk.Grid();

        var hbox = new Gtk.Box ({orientation: Gtk.Orientation.VERTICAL, spacing: 5});
        var vbox = new Gtk.Box ({orientation: Gtk.Orientation.HORIZONTAL, spacing: 5});

        this.loadBookButton = new Gtk.Button ({label: 'Load Book'});
        this.loadTocButton = new Gtk.Button ({label: 'Load Table of Contents'});
        this.loadTotalPageNum = new Gtk.Button ({label: 'Load Page Number'});

        // WebKit preview
        this.web_view = new GbPrivate.WebView();
        this.web_view.register_URI (this.web_view);

        this.loadBookButton.connect("clicked", Lang.bind (this, function () {
            this._onLoadBook('/epub.js/reader/moby-dick/');
        }));

        this.loadTocButton.connect("clicked", Lang.bind (this, function () {
            this._onLoadToc ();
        }));

        this.loadTotalPageNum.connect("clicked", Lang.bind(this, function () {
            this._onLoadTotalPageNum ();
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

        //this._grid.attach (view, 0, 0, 1, 1);
        //this._grid.attach (this.loadButton, 0, 1, 1, 1);
        hbox.pack_start (view, true, true, 0);
        vbox.pack_start (this.loadBookButton, false, false, 0);
        vbox.pack_start (this.loadTocButton, false, false, 0);
        vbox.pack_start (this.loadTotalPageNum, false, false, 0);
        hbox.pack_start (vbox, false, false, 0);
        vbox.set_homogeneous(true);
        this._overlay.add(hbox);

        // Create the horizontal scale
        this.bar_widget = new Gtk.Scale();
        this.bar_widget.set_valign (Gtk.Align.START);
        this.bar_widget.set_value (0);
        this.bar_widget.set_digits (0);
        this.bar_widget.get_style_context().add_class('osd');
        this._overlay.add_overlay(this.bar_widget);
        this.bar_widget.connect ("value-changed", Lang.bind (this, this._update_page));

        this.prev_widget = new Gtk.Button({ child: new Gtk.Image ({ icon_name: 'go-previous-symbolic',
                                                                    pixel_size: 16 }),
                                            margin_left: _PREVIEW_NAVBAR_MARGIN,
                                            margin_right: _PREVIEW_NAVBAR_MARGIN,
                                            halign: Gtk.Align.START,
                                            valign: Gtk.Align.CENTER });
        this.prev_widget.get_style_context().add_class('osd');
        this._overlay.add_overlay(this.prev_widget);
        this.prev_widget.connect('clicked', Lang.bind(this, this._onPrevClicked));
        //this.prev_widget.connect('enter-notify-event', Lang.bind(this, this._onEnterNotify));
        //this.prev_widget.connect('leave-notify-event', Lang.bind(this, this._onLeaveNotify));

        this.next_widget = new Gtk.Button({ child: new Gtk.Image ({ icon_name: 'go-next-symbolic',
                                                                    pixel_size: 16 }),
                                            margin_left: _PREVIEW_NAVBAR_MARGIN,
                                            margin_right: _PREVIEW_NAVBAR_MARGIN,
                                            halign: Gtk.Align.END,
                                            valign: Gtk.Align.CENTER });
        this.next_widget.get_style_context().add_class('osd');
        this._overlay.add_overlay(this.next_widget);
        this.next_widget.connect('clicked', Lang.bind(this, this._onNextClicked));
        //this.next_widget.connect('enter-notify-event', Lang.bind(this, this._onEnterNotify));
        //this.next_widget.connect('leave-notify-event', Lang.bind(this, this._onLeaveNotify));

        //this._overlay.connect('motion-notify-event', Lang.bind(this, this._onMotion));
        this._overlay.show_all();
    },

    _onEnterNotify: function() {
        log("enter notify");
        this._hover = true;
        this._unqueueAutoHide();
        return false;
    },

    _onLeaveNotify: function() {
        log("leave notify");
        this._hover = false;
        this._queueAutoHide();
        return false;
    },

    _motionTimeout: function() {
        log("Motion Timeout");
        this._motionId = 0;
        this._updateVisibility();
        return false;
    },

    _onMotion: function() {
        log("Overlay motion");
        if (this._motionId != 0) {
            return false;
        }

        this._motionId = Mainloop.idle_add(Lang.bind(this, this._motionTimeout));
        return false;
    },

    _autoHide: function() {
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
        if (!this._visible) {
            this._fadeOutButton(this.prev_widget);
            this._fadeOutButton(this.next_widget);
            return;
        }

        this._fadeInButton(this.prev_widget);
        this._fadeInButton(this.next_widget);

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

    _onLoadBook: function(path) {
        this.web_view.run_JS ("var Book = ePub('" + path + "', { width: 1076, height: 588 });");
        this.web_view.run_JS ("var rendered = Book.renderTo('area');");
    },

    _onPrevClicked: function() {
        this.web_view.run_JS("Book.prevPage();");
    },

    _onNextClicked: function() {
        this.web_view.run_JS ("Book.nextPage();");
    },

    _onLoadToc: function() {
        this.web_view.run_JS ("Book.ready.all.then(function(){ Book.generatePagination(); });");
        /*
        this.web_view.run_JS_return("function x() { Book.pageListReady.then(function()   \
                                        { return 'true' }); }; x();", Lang.bind(this, 
            function(src, res) {
                var output = this.web_view.output_JS_finish(res);
                log("----- JS output: " + output)
            }));
        */
    },

    _onLoadTotalPageNum: function() {
        this.web_view.run_JS_return ("(Book.pagination.totalPages).toString();", Lang.bind(this,
            function(src, res) {
                var n_pages = this.web_view.output_JS_finish(res);
                log("----- Total pages: " + n_pages);

                this._adjustment = new Gtk.Adjustment ({
                    value: 0,
                    lower: 0,
                    upper: n_pages,
                    step_increment: 5,
                    page_increment: 10 });

                this.bar_widget.adjustment = this._adjustment;
            }));
    },

    _update_page: function() {
        var value = this.bar_widget.get_value();
        this.web_view.run_JS("Book.gotoPage(" + value + ");");
    }
});