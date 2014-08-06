#ifndef __GB_WEBVIEW_H__
#define __GB_WEBVIEW_H__

#include <gtk/gtk.h>
#include <glib.h>
#include <glib-object.h>

G_BEGIN_DECLS

typedef struct _GbBookState			GbBookState;
typedef struct _GbBookStateClass	GbBookStateClass;
typedef struct _GbBookStatePrivate	GbBookStatePrivate;

#define GB_BOOK_STATE_TYPE 			(gb_book_state_get_type())
#define GB_BOOK_STATE(o)			(G_TYPE_CHECK_INSTANCE_CAST ((o), GB_BOOK_STATE_TYPE, GbBookState))
#define GB_BOOK_STATE_CLASS(c)		(G_TYPE_CHECK_CLASS_CAST ((c), GB_BOOK_STATE_TYPE, GbBookStateClass))
#define GB_IS_BOOK_STATE(o)			(G_TYPE_CHECK_INSTANCE_TYPE ((o), GB_BOOK_STATE_TYPE))
#define GB_IS_BOOK_STATE_CLASS(c)	(G_TYPE_CHECK_CLASS_TYPE ((c),  GB_BOOK_STATE_TYPE))
#define GB_BOOK_STATE_GET_CLASS(o)	(G_TYPE_INSTANCE_GET_CLASS ((o), GB_BOOK_STATE_TYPE, GbBookStateClass))

struct _GbBookState {
	GtkWidget 			base_instace;

    GbBookStatePrivate*	priv;
};

struct _GbBookStateClass {
    GtkWidgetClass		parent_class;
};

GType				gb_book_state_get_type		(void) G_GNUC_CONST;

void				gb_book_state_new			(void);
int 				gb_book_state_get_pages		(GbBookState *self);

#endif /* __GB_WEBVIEW_H__ */
