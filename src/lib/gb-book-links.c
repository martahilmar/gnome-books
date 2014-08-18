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

#include <string.h>

#include <glib/gi18n.h>
#include <gtk/gtk.h>

#include <libgd/gd.h>

#include "gb-book-links.h"

struct _GbBookLinksPrivate {
    GtkWidget *tree_view;

    guint page_changed_id;
    guint link_activated_id;

    GtkTreeModel *model;
    const char *name;
};

enum {
    PROP_0,
    PROP_NAME
};

enum {
    BOOK_LINKS_COLUMN_MARKUP = 0,
    BOOK_LINKS_COLUMN_LABEL,
    BOOK_LINKS_COLUMN_N
};

enum {
    LINK_ACTIVATED,
    N_SIGNALS
};

static guint signals[N_SIGNALS];

G_DEFINE_TYPE (GbBookLinks, gb_book_links, GTK_TYPE_BOX);

#define GB_BOOK_LINKS_GET_PRIVATE(object) \
    (G_TYPE_INSTANCE_GET_PRIVATE ((object), GB_TYPE_BOOK_LINKS, GbBookLinksPrivate))

static gboolean
emit_link_activated (GbBookLinks *self)
{
    GtkTreeSelection *selection;
    GtkTreeModel *model;
    GtkTreeIter iter;

    selection = gtk_tree_view_get_selection (GTK_TREE_VIEW (self->priv->tree_view));
    if (gtk_tree_selection_get_selected (selection, &model, &iter)) {
        gchar *link;

        gtk_tree_model_get (model, &iter,
                            BOOK_LINKS_COLUMN_LABEL, &link,
                            -1);

        if (link == NULL) {
            return FALSE;
        }
        g_signal_emit (self, signals[LINK_ACTIVATED], 0, link);
    }

    self->priv->link_activated_id = 0;

    return FALSE;
}

static void
schedule_emit_link_activated (GbBookLinks *self)
{
    if (self->priv->link_activated_id == 0) {
        self->priv->link_activated_id = g_idle_add ((GSourceFunc) emit_link_activated, self);
    }
}

void
gb_book_links_fill_model (GbBookLinks *self, gchar* markup, gchar* label)
{
    GbBookLinksPrivate *priv = self->priv;
    GtkTreeIter iter;

    gtk_list_store_append (GTK_LIST_STORE (priv->model), &iter);
    gtk_list_store_set (GTK_LIST_STORE (priv->model), &iter,
                        BOOK_LINKS_COLUMN_MARKUP, markup,
                        BOOK_LINKS_COLUMN_LABEL, label,
                        -1);
}

void
gb_book_links_set_model (GbBookLinks *self)
{
    GbBookLinksPrivate *priv = self->priv;
    
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
    g_signal_connect_swapped (priv->tree_view, "row-activated",
                              G_CALLBACK (schedule_emit_link_activated), self);

    gtk_tree_view_set_show_expanders (GTK_TREE_VIEW (priv->tree_view), FALSE);
    gtk_tree_view_set_level_indentation (GTK_TREE_VIEW (priv->tree_view), 20);

    selection = gtk_tree_view_get_selection (GTK_TREE_VIEW (priv->tree_view));
    gtk_tree_selection_set_mode (selection, GTK_SELECTION_BROWSE);
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
    /*
    gtk_tree_view_column_set_attributes (GTK_TREE_VIEW_COLUMN (column), renderer,
                                         "text", BOOK_LINKS_COLUMN_LABEL,
                                         NULL);
    */
    priv->model = (GtkTreeModel *)gtk_list_store_new (BOOK_LINKS_COLUMN_N,
                                                      G_TYPE_STRING,
                                                      G_TYPE_STRING);
}

static void
gd_places_links_dispose (GObject *object)
{
    GbBookLinks *self = GB_BOOK_LINKS (object);
    
    if (self->priv->page_changed_id > 0) {
        g_signal_handler_disconnect (self->priv->model, self->priv->page_changed_id);
        self->priv->page_changed_id = 0;
    }
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

    signals[LINK_ACTIVATED] = g_signal_new ("link-activated",
                                            G_TYPE_FROM_CLASS (oclass),
                                            G_SIGNAL_RUN_LAST | G_SIGNAL_ACTION,
                                            0,
                                            NULL, NULL,
                                            g_cclosure_marshal_VOID__OBJECT,
                                            G_TYPE_NONE, 1, G_TYPE_STRING);
    
    g_object_class_override_property (oclass, PROP_NAME, "name");

    g_type_class_add_private (oclass, sizeof (GbBookLinksPrivate));
}

GtkWidget *
gb_book_links_new (void)
{
    return g_object_new (GB_TYPE_BOOK_LINKS, NULL);
}
