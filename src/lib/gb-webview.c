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

#define GB_WEBVIEW_GET_PRIVATE(o)   \
    (G_TYPE_INSTANCE_GET_PRIVATE ((o), GB_WEBVIEW_TYPE, GbWebViewPrivate))

G_DEFINE_TYPE (GbWebView, gb_webview, G_TYPE_OBJECT)

struct _GbWebViewPrivate {
    WebKitWebView *webView;
    GSimpleAsyncResult *result;

    gchar* output_JS;
};

enum
{
    PROP_0,
    PROP_WEBVIEW
};

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
        file = g_file_new_for_path ("epub.js/examples/single.html");
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
    //GbWebView *self = GB_WEBVIEW (object);

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
gb_webview_finalize (GObject *object)
{
    GbWebView *self = GB_WEBVIEW (object);
    GbWebViewPrivate *priv = GB_WEBVIEW_GET_PRIVATE (self->priv);

    g_free (priv->webView);
    G_OBJECT_CLASS (gb_webview_parent_class)->finalize (object);
}

static void
gb_webview_class_init (GbWebViewClass *class)
{
    GObjectClass *object_class = G_OBJECT_CLASS (class);

    object_class->get_property = gb_webview_get_property;
    object_class->set_property = gb_webview_set_property;
    object_class->finalize = gb_webview_finalize;

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
    GbWebViewPrivate* priv;

    self->priv = GB_WEBVIEW_GET_PRIVATE (self);
    priv = self->priv;

    priv->webView = WEBKIT_WEB_VIEW(webkit_web_view_new());
    priv->output_JS = NULL;

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


void
gb_web_view_finished_JS      (GObject*      webView,
                              GAsyncResult  *result,
                              gpointer      user_data)
{
    //WebKitWebView* webView;
    GbWebView* self = user_data;
    //webView = self->priv->webView;

    WebKitJavascriptResult *js_result;
    JSValueRef              value;
    JSGlobalContextRef      context;
    GError                 *error = NULL;

    js_result = webkit_web_view_run_javascript_finish (WEBKIT_WEB_VIEW(webView), result, &error);
    if (!js_result) {
        g_warning ("Error running javascript: %s", error->message);
        g_error_free (error);
        return;
    }

    context = webkit_javascript_result_get_global_context (js_result);
    value = webkit_javascript_result_get_value (js_result);
    //if (JSValueIsString (context, value)) {
        JSStringRef js_str_value;
        gchar      *str_value;
        gsize       str_length;

        js_str_value = JSValueToStringCopy (context, value, NULL);
        str_length = JSStringGetMaximumUTF8CStringSize (js_str_value);
        str_value = (gchar *)g_malloc (str_length);
        JSStringGetUTF8CString (js_str_value, str_value, str_length);
        JSStringRelease (js_str_value);

        self->priv->output_JS = strdup(str_value);
        g_print ("----------------- Script result: %s\n", self->priv->output_JS);

        g_simple_async_result_set_op_res_gpointer (self->priv->result, self->priv->output_JS, NULL);
        g_simple_async_result_complete_in_idle (self->priv->result);

        g_free (str_value);
        g_object_unref (self->priv->result);
        /*
    } else {
        g_warning ("Error running javascript: unexpected return value");
        g_simple_async_result_take_error (self->priv->result, error);
        g_simple_async_result_complete_in_idle (self->priv->result);
    }*/
    webkit_javascript_result_unref (js_result);
}

/**
* gb_webview_get_view:
* @self: #GbWebView
*
* Returns the WebKitWebView @self.
*
* Returns: (transfer none): the button area #WebKitWebView.
*/
WebKitWebView*      
gb_webview_get_view (GbWebView *self)
{
    g_return_val_if_fail (GB_IS_WEBVIEW (self), NULL);

    return self->priv->webView;
}

void
gb_webview_register_URI (GbWebView *self)
{
    WebKitWebView* webView;
    
    webView = self->priv->webView;
    gb_register_uri ();
    g_idle_add(gb_load, webView);
}

void
gb_webview_run_JS (GbWebView* self, 
                   gchar*     load_command)
{
    WebKitWebView* webView;
    
    webView = self->priv->webView;
    webkit_web_view_run_javascript (webView, load_command, NULL, NULL, NULL);
}

/**
 * gb_webview_run_JS_return:
 * @self:
 * @load_command:
 * @callback:
 * @user_data:
 */
void
gb_webview_run_JS_return (GbWebView* self, 
                          gchar*     load_command,
                          GAsyncReadyCallback callback,
                          gpointer user_data)
{
    self->priv->result = g_simple_async_result_new (NULL, callback, user_data,
                                                    gb_webview_run_JS_return);

    webkit_web_view_run_javascript (self->priv->webView, load_command, NULL, gb_web_view_finished_JS, self);
    
}

/**
 * gb_webview_output_JS_finish:
 * @res:
 * @error: (allow-none) (out):
 *
 * Returns: (transfer full):
 */
gchar*
gb_webview_output_JS_finish (GAsyncResult *res,
                               GError **error)
{
  if (g_simple_async_result_propagate_error (G_SIMPLE_ASYNC_RESULT (res), error))
    return NULL;

  return g_simple_async_result_get_op_res_gpointer (G_SIMPLE_ASYNC_RESULT (res));
}

/**
* gb_webview_new:
*
* Creates WebKitWevView.
*
* Returns: a new #WebKitWebView object.
*/
WebKitWebView*
gb_webview_new ()
{
    GObject *self;

    self = g_object_new (GB_WEBVIEW_TYPE,
                         "books-view",
                         NULL);

    return WEBKIT_WEB_VIEW(self);
}
/*
void 
gb_close_WebViewCb (WebKitWebView*  webView, 
                    GtkWidget*      window)
{
    printf("Bye bye\n");
    gtk_widget_destroy(window);
} */