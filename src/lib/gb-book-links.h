#ifndef __GB_BOOK_LINKS_H__
#define __GB_BOOK_LINKS_H__

#include <gtk/gtk.h>

G_BEGIN_DECLS

typedef struct _GbBookLinks GbBookLinks;
typedef struct _GbBookLinksClass GbBookLinksClass;
typedef struct _GbBookLinksPrivate GbBookLinksPrivate;

#define GB_TYPE_BOOK_LINKS              (gb_book_links_get_type())
#define GB_BOOK_LINKS(object)           (G_TYPE_CHECK_INSTANCE_CAST((object), GB_TYPE_BOOK_LINKS, GbBookLinks))
#define GB_BOOK_LINKS_CLASS(klass)      (G_TYPE_CHECK_CLASS_CAST((klass), GB_TYPE_BOOK_LINKS, GbBookLinksClass))
#define GB_IS_BOOK_LINKS(object)        (G_TYPE_CHECK_INSTANCE_TYPE((object), GB_TYPE_BOOK_LINKS))
#define GB_IS_BOOK_LINKS_CLASS(klass)   (G_TYPE_CHECK_CLASS_TYPE((klass), GB_TYPE_BOOK_LINKS))
#define GB_BOOK_LINKS_GET_CLASS(object) (G_TYPE_INSTANCE_GET_CLASS((object), GB_TYPE_BOOK_LINKS, GbBookLinksClass))

struct _GbBookLinks {
        GtkBox base_instance;

        GbBookLinksPrivate *priv;
};

struct _GbBookLinksClass {
        GtkBoxClass base_class;
};

GType      	gb_book_links_get_type       	(void);
GtkWidget* 	gb_book_links_new            	(void);
void 		gb_book_links_fill_model 		(GbBookLinks *self, gchar* markup, gchar* label);
void 		gb_book_links_set_model 		(GbBookLinks *self);

G_END_DECLS

#endif /* __GB_BOOK_LINKS_H__ */


