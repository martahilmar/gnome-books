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

#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <unistd.h>
#include <gtk/gtk.h>

#include <webkit2/webkit2.h>
#include <JavaScriptCore/JavaScript.h>
#include <JavaScriptCore/JSStringRef.h>
#include <JavaScriptCore/JSValueRef.h>
#include <sys/types.h>

#include "gb-webview.h"

//WebKitWebView *webView;

#define GB_WEBVIEW_GET_PRIVATE(o)   \
    (G_TYPE_INSTANCE_GET_PRIVATE ((o), GB_WEBVIEW_TYPE, GbWebViewPrivate))

G_DEFINE_TYPE (GbWebView, gb_webview, G_TYPE_OBJECT)

struct _GbWebViewPrivate {
    WebKitWebView *webView;
};

enum
{
    PROP_0,
    PROP_WEBVIEW
};


static void
load_book (WebKitWebView* webView)
{
    gchar *load_command = g_strdup_printf ("var Book = ePub('/epub.js/reader/moby-dick/', { width: 1076, height: 588 });");
    webkit_web_view_run_javascript (webView, load_command, NULL, NULL, NULL);
    g_free(load_command);
}

static void
render_book (WebKitWebView* webView)
{
    gchar *render_command = g_strdup_printf ("var rendered = Book.renderTo('area').then(function(){});");
    webkit_web_view_run_javascript (webView, render_command, NULL, NULL, NULL);
    g_free(render_command);
}

void
gb_webkit_load_changed (WebKitWebView  *web_view,
                        WebKitLoadEvent load_event,
                        gpointer        user_data )
{
    const gchar *uri = webkit_web_view_get_uri (web_view);

    switch (load_event) {
    case WEBKIT_LOAD_STARTED:
        /* New load, we have now a provisional URI */
        printf("webkit_load_started: '%s' \n", uri);
        /* Here we could start a spinner or update the
         * location bar with the provisional URI */
        break;
    case WEBKIT_LOAD_REDIRECTED:
        printf("webkit_load_redirected: '%s' \n", uri);
        break;
    case WEBKIT_LOAD_COMMITTED:
        /* The load is being performed. Current URI is
         * the final one and it won't change unless a new
         * load is requested or a navigation within the
         * same page is performed */
        printf("webkit_load_commited: '%s' \n", uri);
        break;
    case WEBKIT_LOAD_FINISHED:
        /* Load finished, we can now stop the spinner */
        printf("webkit_load_finished: '%s' \n", uri);
        //load_book(web_view);
        //render_book(web_view);
        break;
    }
}

gboolean
gb_webkit_load_failed (WebKitWebView  *web_view,
                       WebKitLoadEvent load_event,
                       gchar          *failing_uri,
                       gpointer        error,
                       gpointer        user_data )
{
    printf("Failed to load %s!\n", failing_uri);

    return TRUE;
}

gboolean
gb_webkit_process_crashed (WebKitWebView *web_view,
                           gpointer       user_data )
{
    printf("WebKit Crashed!\n");

    return TRUE;
}

void
gb_webkit_insecure_content_detected (WebKitWebView             *web_view,
                                     WebKitInsecureContentEvent event,
                                     gpointer                   user_data )
{
    printf("webkit_insecure_content_detected\n");
}

void
gb_request_cb (WebKitURISchemeRequest *request, 
               gpointer data)
{
    const gchar *path = webkit_uri_scheme_request_get_path (request);
    GFile *file = NULL;
    GError *error = NULL;

    printf("Path: %s \n", path);

    if (!path || path[0] == '\0') {
        file = g_file_new_for_path ("epub.js/examples/single1.html");
    } else {
        gchar *dir = g_get_current_dir ();
        gchar *fn = g_build_filename (dir, path, NULL);
        file = g_file_new_for_path (fn);
        g_free (dir);
        g_free (fn);
    }

    GFileInputStream *strm = g_file_read (file, NULL, &error);
    if (error) {
        webkit_uri_scheme_request_finish_error (request, error);
        return;
    }

    webkit_uri_scheme_request_finish (request, G_INPUT_STREAM (strm), -1, "text/html");
    g_object_unref (strm);
    g_object_unref (file);
}

void
gb_register_uri ()
{
    WebKitWebContext *context = webkit_web_context_get_default ();
    WebKitSecurityManager *security = webkit_web_context_get_security_manager (context);

    webkit_web_context_register_uri_scheme (context, "book", gb_request_cb, NULL, NULL);
    webkit_security_manager_register_uri_scheme_as_cors_enabled (security, "book");
}

gboolean
gb_load (gpointer pointer)
{   
    webkit_web_view_load_uri (WEBKIT_WEB_VIEW (pointer), "book:");

    return FALSE;
}

static void
gb_webview_get_property (GObject    *object,
                         guint       property_id,
                         GValue     *value,
                         GParamSpec *pspec)
{
    GbWebView *self = GB_WEBVIEW (object);

    switch (property_id) {
    case PROP_WEBVIEW:
       g_value_set_object (value, self->priv->webView);
       break;

    default:
       G_OBJECT_WARN_INVALID_PROPERTY_ID (object, property_id, pspec);
       break;
    }
}

static void
gb_webview_set_property (GObject      *object,
                         guint         property_id,
                         const GValue *value,
                         GParamSpec   *pspec)
{
    GbWebView *self = GB_WEBVIEW (object);

    switch (property_id) {
    case PROP_WEBVIEW:
        //g_free (priv->webView);
        
    break;
    default:
        G_OBJECT_WARN_INVALID_PROPERTY_ID (object, property_id, pspec);
        break;
    }
}

static void
gb_webview_class_init (GbWebViewClass *class)
{
    GObjectClass *object_class = G_OBJECT_CLASS (class);

    object_class->get_property = gb_webview_get_property;
    object_class->set_property = gb_webview_set_property;
    //object_class->finalize = gb_webview_finalize;
    g_object_class_install_property (object_class,
                                     PROP_WEBVIEW,
                                     g_param_spec_object ("books-view",
                                                          "Books view",
                                                          "The Books View",
                                                          GTK_TYPE_WIDGET,
                                                          G_PARAM_CONSTRUCT |
                                                          G_PARAM_READWRITE |
                                                          G_PARAM_STATIC_STRINGS));

    g_type_class_add_private (object_class, sizeof (GbWebViewPrivate));
}

static void
gb_webview_init (GbWebView* self)
{
    GbWebViewPrivate*   priv;

    self->priv = GB_WEBVIEW_GET_PRIVATE (self);
    priv = self->priv;

    priv->webView = WEBKIT_WEB_VIEW(webkit_web_view_new());

    WebKitSettings *s = webkit_web_view_get_settings(WEBKIT_WEB_VIEW(priv->webView));
    
    webkit_settings_set_enable_write_console_messages_to_stdout(s, TRUE);
    webkit_settings_set_enable_fullscreen(s, TRUE);

    g_object_set(G_OBJECT(s),"enable-fullscreen", TRUE,
                             "enable-javascript", TRUE, 
                             "enable-developer-extras", TRUE,
                             "enable-xss-auditor", FALSE,
                             "enable-plugins", FALSE,
                             "enable-write-console-messages-to-stdout", TRUE, NULL);
    // g_object_set(G_OBJECT(s),"auto-load-images", FALSE, NULL); // We only load the current pages +-1

    webkit_web_view_set_settings(WEBKIT_WEB_VIEW(priv->webView), s);

    //g_signal_connect(mainWindow, "destroy", G_CALLBACK(gb_destroy_windowCb), NULL);
    //g_signal_connect(webView, "close", G_CALLBACK(gb_close_WebViewCb), mainWindow);
    g_signal_connect(priv->webView, "load-changed", G_CALLBACK(gb_webkit_load_changed), NULL);
    g_signal_connect(priv->webView, "load-failed", G_CALLBACK(gb_webkit_load_failed), NULL);
    g_signal_connect(priv->webView, "web-process-crashed", G_CALLBACK(gb_webkit_process_crashed), NULL);
    g_signal_connect(priv->webView, "insecure-content-detected", G_CALLBACK(gb_webkit_insecure_content_detected), NULL);

    // Make sure that when the browser area becomes visible, it will get mouse
    // and keyboard events
    gtk_widget_grab_focus(GTK_WIDGET(priv->webView));
}

WebKitWebView*      
gb_webview_get_view (GbWebView *self)
{
    g_return_val_if_fail (GB_IS_WEBVIEW (self), NULL);

    return self->priv->webView;
}

void
gb_webview_register_URI (GbWebView *self)
{
    WebKitWebView *webView;

    webView = self->priv->webView;
    gb_register_uri ();
    g_idle_add(gb_load, webView);
}
/*
static void
gb_webview_finalize (GObject *object)
{
    GbWebViewPrivate *priv = GB_WEBVIEW_GET_PRIVATE (object);

    g_free (priv->webView);
    G_OBJECT_CLASS (gb_webview_parent_class)->finalize (object);
}*/

GtkWidget*
gb_webview_new ()
{
    GObject *self;

    self = g_object_new (GB_WEBVIEW_TYPE,
                         "books-view",
                         NULL);

    return GTK_WIDGET (self);
}
/*
void 
gb_close_WebViewCb (WebKitWebView*  webView, 
                    GtkWidget*      window)
{
    printf("Bye bye\n");
    gtk_widget_destroy(window);
} */