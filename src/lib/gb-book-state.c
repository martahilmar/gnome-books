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

#include "gb-book-state.h"

#define GB_BOOK_STATE_GET_PRIVATE(o)   \
    (G_TYPE_INSTANCE_GET_PRIVATE ((o), GB_BOOK_STATE_TYPE, GbBookStatePrivate))

G_DEFINE_TYPE (GbBookState, gb_book_state, G_TYPE_OBJECT)

struct _GbBookStatePrivate {
  int pages;
};

enum
{
    PROP_0,
    PROP_BOOK_STATE
};

static void
gb_book_state_class_init (GbBookStateClass *class)
{
    GObjectClass *object_class = G_OBJECT_CLASS (class);

    //object_class->get_property = gb_webview_get_property;
    //object_class->set_property = gb_webview_set_property;
    //object_class->finalize = gb_webview_finalize;

    g_object_class_install_property (object_class,
                                     PROP_BOOK_STATE,
                                     g_param_spec_object ("books-state",
                                                          "Books state",
                                                          "The Books State",
                                                          GTK_TYPE_WIDGET,
                                                          G_PARAM_CONSTRUCT |
                                                          G_PARAM_READWRITE |
                                                          G_PARAM_STATIC_STRINGS));

    g_type_class_add_private (object_class, sizeof (GbBookStatePrivate));
}

static void
gb_book_state_init (GbBookState* self)
{
    GbBookStatePrivate* priv;

    self->priv = GB_BOOK_STATE_GET_PRIVATE (self);
    priv = self->priv;
}

/**
* gb_webview_get_pages:
*
* Returns the number of pages.
*
* Returns: (transfer none): value #int.
*/
int      
gb_book_state_get_pages (GbBookState *self)
{
    g_return_val_if_fail (GB_IS_BOOK_STATE (self), NULL);

    return self->priv->pages;
}

void
gb_book_state_new ()
{
    GObject *self;

    self = g_object_new (GB_BOOK_STATE_TYPE,
                         "books-state",
                         NULL);

    //return self;
}