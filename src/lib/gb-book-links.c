#include <string.h>

#include <glib/gi18n.h>
#include <gtk/gtk.h>

#include <libgd/gd.h>

#include "gb-book-links.h"

struct _GbBookLinksPrivate {
        GtkWidget *tree_view;

        GtkTreeModel *model;
        const char *name;
};

enum {
        PROP_0,
        PROP_NAME
};

enum {
    BOOK_LINKS_COLUMN_MARKUP = 0,
    BOOK_LINKS_COLUMN_PAGE_LABEL,
    BOOK_LINKS_COLUMN_N
};



G_DEFINE_TYPE (GbBookLinks, gb_book_links, GTK_TYPE_BOX);

#define GB_BOOK_LINKS_GET_PRIVATE(object) \
    (G_TYPE_INSTANCE_GET_PRIVATE ((object), GB_TYPE_BOOK_LINKS, GbBookLinksPrivate))

void
gb_book_links_fill_model (GbBookLinks *self, gchar* markup, gchar* label)
{
    GbBookLinksPrivate *priv = self->priv;
    GtkTreeIter iter;

    gtk_list_store_append (GTK_LIST_STORE (priv->model), &iter);
    gtk_list_store_set (GTK_LIST_STORE (priv->model), &iter,
                      BOOK_LINKS_COLUMN_MARKUP, markup,
                      BOOK_LINKS_COLUMN_PAGE_LABEL, label,
                      -1);
}

void
gb_book_links_set_model (GbBookLinks *self)
{
    GbBookLinksPrivate *priv = self->priv;
    
    //priv->model = create_and_fill_model ();
    gtk_tree_view_set_model (GTK_TREE_VIEW (priv->tree_view), priv->model);
}

static void
gb_book_links_construct (GbBookLinks *self)
{
    GbBookLinksPrivate *priv;
    GtkWidget *swindow;
    GtkTreeViewColumn *column;
    GtkCellRenderer *renderer;
    GtkTreeSelection *selection;

    priv = self->priv;

    swindow = gtk_scrolled_window_new (NULL, NULL);

    gtk_scrolled_window_set_shadow_type (GTK_SCROLLED_WINDOW (swindow),
                                         GTK_SHADOW_IN);

    /* Create tree view */
    priv->tree_view = gtk_tree_view_new ();
    gtk_tree_view_set_activate_on_single_click (GTK_TREE_VIEW (priv->tree_view), TRUE);
    
    gtk_tree_view_set_show_expanders (GTK_TREE_VIEW (priv->tree_view), FALSE);
    gtk_tree_view_set_level_indentation (GTK_TREE_VIEW (priv->tree_view), 20);

    selection = gtk_tree_view_get_selection (GTK_TREE_VIEW (priv->tree_view));
    gtk_tree_selection_set_mode (selection, GTK_SELECTION_NONE);
    gtk_tree_view_set_headers_visible (GTK_TREE_VIEW (priv->tree_view), FALSE);

    gtk_container_add (GTK_CONTAINER (swindow), priv->tree_view);

    gtk_box_pack_start (GTK_BOX (self), swindow, TRUE, TRUE, 0);
    gtk_widget_show_all (GTK_WIDGET (self));

    column = gtk_tree_view_column_new ();
    gtk_tree_view_column_set_expand (GTK_TREE_VIEW_COLUMN (column), TRUE);
    gtk_tree_view_append_column (GTK_TREE_VIEW (priv->tree_view), column);

    renderer = (GtkCellRenderer *)
            g_object_new (GTK_TYPE_CELL_RENDERER_TEXT,
                          "ellipsize", PANGO_ELLIPSIZE_END,
                          "weight", PANGO_WEIGHT_BOLD,
                          "xpad", 10,
                          NULL);
    gtk_tree_view_column_pack_start (GTK_TREE_VIEW_COLUMN (column), renderer, TRUE);
    
    gtk_tree_view_column_set_attributes (GTK_TREE_VIEW_COLUMN (column), renderer,
                                         "markup", BOOK_LINKS_COLUMN_MARKUP,
                                         NULL);
    
    renderer = gd_styled_text_renderer_new ();
    gd_styled_text_renderer_add_class (GD_STYLED_TEXT_RENDERER (renderer), "dim-label");
    g_object_set (renderer,
                  "max-width-chars", 12,
                  "scale", PANGO_SCALE_SMALL,
                  "xalign", 1.0,
                  "xpad", 10,
                  NULL);
    gtk_tree_view_column_pack_end (GTK_TREE_VIEW_COLUMN (column), renderer, FALSE);
    
    gtk_tree_view_column_set_attributes (GTK_TREE_VIEW_COLUMN (column), renderer,
                                         "text", BOOK_LINKS_COLUMN_PAGE_LABEL,
                                         NULL);

    priv->model = (GtkTreeModel *)gtk_list_store_new (BOOK_LINKS_COLUMN_N,
                                                      G_TYPE_STRING,
                                                      G_TYPE_STRING);
}

static void
gd_places_links_dispose (GObject *object)
{
    GbBookLinks *self = GB_BOOK_LINKS (object);

    g_clear_object (&self->priv->model);

    G_OBJECT_CLASS (gb_book_links_parent_class)->dispose (object);
}

static void
gb_book_links_set_property (GObject      *object,
                            guint         prop_id,
                            const GValue *value,
                            GParamSpec   *pspec)
{
    //GbBookLinks *self = GB_BOOK_LINKS (object);

    switch (prop_id) {
    default:
        G_OBJECT_WARN_INVALID_PROPERTY_ID (object, prop_id, pspec);
        break;
    }
}

static void
gb_book_links_get_property (GObject    *object,
                            guint       prop_id,
                            GValue     *value,
                            GParamSpec *pspec)
{
    GbBookLinks *self = GB_BOOK_LINKS (object);

    switch (prop_id) {
    case PROP_NAME:
        g_value_set_string (value, self->priv->name);
        break;
    default:
        G_OBJECT_WARN_INVALID_PROPERTY_ID (object, prop_id, pspec);
        break;
    }
}

static void
gb_book_links_init (GbBookLinks *self)
{
    self->priv = GB_BOOK_LINKS_GET_PRIVATE (self);

    self->priv->name = _("Contents");

    gb_book_links_construct (self);
}

static void
gb_book_links_class_init (GbBookLinksClass *klass)
{
    GObjectClass *oclass = G_OBJECT_CLASS (klass);

    oclass->dispose = gd_places_links_dispose;
    oclass->set_property = gb_book_links_set_property;
    oclass->get_property = gb_book_links_get_property;

    g_object_class_override_property (oclass, PROP_NAME, "name");

    g_type_class_add_private (oclass, sizeof (GbBookLinksPrivate));
}

GtkWidget *
gb_book_links_new (void)
{
    return g_object_new (GB_TYPE_BOOK_LINKS, NULL);
}
