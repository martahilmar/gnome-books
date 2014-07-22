/* -*- Mode: c; c-basic-offset: 4 -*- 
 *
 * GOBject Introspection Tutorial 
 * 
 * Written in 2013 by Simon Kågedal Reimer <skagedal@gmail.com>
 *
 * To the extent possible under law, the author have dedicated all
 * copyright and related and neighboring rights to this software to
 * the public domain worldwide. This software is distributed without
 * any warranty.
 *
 * CC0 Public Domain Dedication:
 * http://creativecommons.org/publicdomain/zero/1.0/
 */

#ifndef __GB_WEBVIEW_H__
#define __GB_WEBVIEW_H__

#include <gtk/gtk.h>
#include <glib.h>
#include <glib-object.h>
#include <webkit2/webkit2.h>

G_BEGIN_DECLS

typedef struct _GbWebView			GbWebView;
typedef struct _GbWebViewClass		GbWebViewClass;
typedef struct _GbWebViewPrivate	GbWebViewPrivate;

#define GB_WEBVIEW_TYPE 		(gb_webview_get_type())
#define GB_WEBVIEW(o)			(G_TYPE_CHECK_INSTANCE_CAST ((o), GB_WEBVIEW_TYPE, GbWebView))
#define GB_WEBVIEW_CLASS(c)		(G_TYPE_CHECK_CLASS_CAST ((c), GB_WEBVIEW_TYPE, GbWebViewClass))
#define GB_IS_WEBVIEW(o)		(G_TYPE_CHECK_INSTANCE_TYPE ((o), GB_WEBVIEW_TYPE))
#define GB_IS_WEBVIEW_CLASS(c)	(G_TYPE_CHECK_CLASS_TYPE ((c),  GB_WEBVIEW_TYPE))
#define GB_WEBVIEW_GET_CLASS(o)	(G_TYPE_INSTANCE_GET_CLASS ((o), GB_WEBVIEW_TYPE, GbWebViewClass))

struct _GbWebView {
	GtkWidget 			base_instace;

    GbWebViewPrivate*	priv;
};

struct _GbWebViewClass {
    GtkWidgetClass		parent_class;
};

GType			gb_webview_get_type		(void) G_GNUC_CONST;

WebKitWebView*	gb_webview_new			(void);
WebKitWebView*	gb_webview_get_view		(GbWebView* self);
void			gb_webview_register_URI	(GbWebView* self);
/*void            gb_webview_register_URI (GbWebView *self,
				                         GCancellable* cancellable,
				                         GAsyncReadyCallback callback);*/
void			gb_webview_run_JS		(GbWebView *self, gchar* load_command);
/*void			gb_webview_load_book 	(GbWebView* self,
					                     const gchar* uri,
					                     GCancellable* cancellable,
					                     GAsyncReadyCallback callback);*/

#endif /* __GB_WEBVIEW_H__ */
