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

#include <math.h>
#include <glib.h>
#include <glib/gi18n.h>
#include <glib-object.h>
#include <gtk/gtk.h>
#include <string.h>

#include "gb-nav-bar.h"

#define GB_NAV_BAR_GET_PRIVATE(o) \
        (G_TYPE_INSTANCE_GET_PRIVATE ((o), GB_TYPE_NAV_BAR, GbNavBarPrivate))

G_DEFINE_TYPE (GbNavBar, gb_nav_bar, GTK_TYPE_BOX);

enum {
  PROP_HOVER = 1,
  PROP_SCALE_CHANGED,
  NUM_PROPERTIES
};

struct _GbNavBarPrivate {
  GtkWidget *button_area;
  GtkWidget *scale;
  GtkWidget *page_label;

  guint update_id;
  guint show_id;
  int current_page;
  int n_pages;

  gboolean hover;
};

static void
update_page_label (GbNavBar *self)
{
  char *text;

  text = g_strdup_printf (_("Page %u of %u"), self->priv->current_page + 1, self->priv->n_pages);
  gtk_label_set_text (GTK_LABEL (self->priv->page_label), text);
  g_free (text);
}

static void
update_scale (GbNavBar *self)
{
  gtk_range_set_value (GTK_RANGE (self->priv->scale), self->priv->current_page);
}

static void
gb_nav_bar_get_property (GObject    *object,
                         guint       prop_id,
                         GValue     *value,
                         GParamSpec *pspec)
{
  GbNavBar *self = GB_NAV_BAR (object);

  switch (prop_id) {
  case PROP_HOVER:
    g_value_set_boolean (value, gb_nav_bar_get_hover (self));
    break;
  case PROP_SCALE_CHANGED:
    g_value_set_boolean (value, gb_nav_bar_get_hover (self));
    break;    
  default:
    G_OBJECT_WARN_INVALID_PROPERTY_ID (object, prop_id, pspec);
    break;
  }
}

static void
gb_nav_bar_set_property (GObject      *object,
                         guint         prop_id,
                         const GValue *value,
                         GParamSpec   *pspec)
{
  switch (prop_id) {
  default:
    G_OBJECT_WARN_INVALID_PROPERTY_ID (object, prop_id, pspec);
    break;
  }
}

static void
gb_nav_bar_dispose (GObject *object)
{
  G_OBJECT_CLASS (gb_nav_bar_parent_class)->dispose (object);
}

static void
gb_nav_bar_set_hover (GbNavBar *self,
                      gboolean  hover)
{
  if (self->priv->hover == hover) 
  {
    return;
  }

  self->priv->hover = hover;
  g_object_notify (G_OBJECT (self), "hover");
}

static gboolean
gb_nav_bar_enter_notify (GtkWidget        *widget,
                         GdkEventCrossing *event)
{
  GbNavBar *self = GB_NAV_BAR (widget);

  if (event->detail != GDK_NOTIFY_INFERIOR) {
    gb_nav_bar_set_hover (self, TRUE);
  }

  return FALSE;
}

static gboolean
gb_nav_bar_leave_notify (GtkWidget        *widget,
                         GdkEventCrossing *event)
{
  GbNavBar *self = GB_NAV_BAR (widget);

  if (event->detail != GDK_NOTIFY_INFERIOR) {
    gb_nav_bar_set_hover (self, FALSE);
  }

  return FALSE;
}

static void
gb_nav_bar_size_allocate (GtkWidget     *widget,
                          GtkAllocation *allocation)
{
  GTK_WIDGET_CLASS (gb_nav_bar_parent_class)->size_allocate (widget, allocation);

  if (gtk_widget_get_realized (widget)) {
      gdk_window_move_resize (gtk_widget_get_window (widget),
                              allocation->x,
                              allocation->y,
                              allocation->width,
                              allocation->height);
  }
}

static void
gb_nav_bar_realize (GtkWidget *widget)
{
  GtkAllocation allocation;
  GdkWindow *window;
  GdkWindowAttr attributes;
  gint attributes_mask;

  gtk_widget_get_allocation (widget, &allocation);

  gtk_widget_set_realized (widget, TRUE);

  attributes.window_type = GDK_WINDOW_CHILD;
  attributes.x = allocation.x;
  attributes.y = allocation.y;
  attributes.width = allocation.width;
  attributes.height = allocation.height;
  attributes.wclass = GDK_INPUT_OUTPUT;
  attributes.visual = gtk_widget_get_visual (widget);
  attributes.event_mask = gtk_widget_get_events (widget);
  attributes.event_mask |= (GDK_BUTTON_PRESS_MASK |
                            GDK_BUTTON_RELEASE_MASK |
                            GDK_TOUCH_MASK |
                            GDK_ENTER_NOTIFY_MASK |
                            GDK_LEAVE_NOTIFY_MASK);

  attributes_mask = GDK_WA_X | GDK_WA_Y | GDK_WA_VISUAL;

  window = gdk_window_new (gtk_widget_get_parent_window (widget),
                           &attributes, attributes_mask);
  gtk_widget_set_window (widget, window);
  gtk_widget_register_window (widget, window);

  gtk_style_context_set_background (gtk_widget_get_style_context (widget), window);
}

static gboolean
gb_nav_bar_draw (GtkWidget *widget,
                 cairo_t   *cr)
{
  GtkStyleContext *context;

  context = gtk_widget_get_style_context (widget);

  gtk_render_background (context, cr, 0, 0,
                         gtk_widget_get_allocated_width (widget),
                         gtk_widget_get_allocated_height (widget));

  gtk_render_frame (context, cr, 0, 0,
                    gtk_widget_get_allocated_width (widget),
                    gtk_widget_get_allocated_height (widget));

  return GTK_WIDGET_CLASS (gb_nav_bar_parent_class)->draw (widget, cr);
}

static void
gb_nav_bar_class_init (GbNavBarClass *class)
{
  GObjectClass *oclass = G_OBJECT_CLASS (class);
  GtkWidgetClass *wclass = GTK_WIDGET_CLASS (class);

  oclass->dispose = gb_nav_bar_dispose;
  oclass->get_property = gb_nav_bar_get_property;
  oclass->set_property = gb_nav_bar_set_property;

  wclass->draw = gb_nav_bar_draw;
  wclass->realize = gb_nav_bar_realize;
  wclass->enter_notify_event = gb_nav_bar_enter_notify;
  wclass->leave_notify_event = gb_nav_bar_leave_notify;
  wclass->size_allocate = gb_nav_bar_size_allocate;

  g_object_class_install_property (oclass,
                                   PROP_HOVER,
                                   g_param_spec_boolean ("hover",
                                                         "Hover",
                                                         "Whether the widget is hovered",
                                                         FALSE,
                                                         G_PARAM_READABLE |
                                                         G_PARAM_STATIC_STRINGS));

  g_object_class_install_property (oclass,
                                   PROP_SCALE_CHANGED,
                                   g_param_spec_boolean ("scale-changed",
                                                         "Scale changed",
                                                         "When the scale value changes",
                                                         FALSE,
                                                         G_PARAM_READABLE |
                                                         G_PARAM_STATIC_STRINGS));

  g_type_class_add_private (oclass, sizeof (GbNavBarPrivate));
}

static void
scale_value_changed_cb (GtkRange *range,
                        GbNavBar *self)
{
  int page;
  page = round (gtk_range_get_value (GTK_RANGE (self->priv->scale)));

  if(page != self->priv->current_page)
  {
    gb_nav_bar_update_page (self, page);
    g_object_notify (G_OBJECT (self), "scale-changed");
  }
}

static void
gb_nav_bar_init (GbNavBar *self)
{
  GbNavBarPrivate *priv;
  GtkWidget *inner_box;

  self->priv = GB_NAV_BAR_GET_PRIVATE (self);

  priv = self->priv;

  gtk_widget_set_has_window (GTK_WIDGET (self), TRUE);

  inner_box = gtk_box_new (GTK_ORIENTATION_HORIZONTAL, 5);
  gtk_container_set_border_width (GTK_CONTAINER (inner_box), 10);
  gtk_box_set_spacing (GTK_BOX (inner_box), 10);
  gtk_widget_show (inner_box);
  gtk_widget_set_hexpand (GTK_WIDGET (inner_box), TRUE);
  gtk_container_add (GTK_CONTAINER (self), inner_box);

  priv->button_area = gtk_box_new (GTK_ORIENTATION_HORIZONTAL, 0);
  gtk_widget_set_margin_left (priv->button_area, 5);
  gtk_widget_set_margin_right (priv->button_area, 5);
  gtk_widget_show (priv->button_area);
  gtk_box_pack_start (GTK_BOX (inner_box), priv->button_area, FALSE, FALSE, 0);

  priv->scale = gtk_scale_new (GTK_ORIENTATION_HORIZONTAL, NULL);
  gtk_scale_set_draw_value (GTK_SCALE (priv->scale), FALSE);
  gtk_scale_set_has_origin (GTK_SCALE (priv->scale), TRUE);
  gtk_range_set_increments (GTK_RANGE (priv->scale), 1.0, 1.0);
  gtk_range_set_range (GTK_RANGE (priv->scale), 0.0, 1.0);
  gtk_widget_show (priv->scale);
  gtk_box_pack_start (GTK_BOX (inner_box), priv->scale, TRUE, TRUE, 0);

  priv->page_label = gtk_label_new (NULL);
  gtk_widget_show (priv->page_label);
  gtk_box_pack_end (GTK_BOX (inner_box), priv->page_label, FALSE, FALSE, 0);

  gtk_container_set_border_width (GTK_CONTAINER (self), 0);

  gtk_style_context_add_class (gtk_widget_get_style_context (GTK_WIDGET (self)),
                               GTK_STYLE_CLASS_TOOLBAR);

  g_signal_connect (priv->scale, "value-changed",
                    G_CALLBACK (scale_value_changed_cb),
                    self);
}

/**
 * gb_nav_bar_get_button_area:
 * @bar: a #GbNavBar
 *
 * Returns the button area of @bar.
 *
 * Returns: (transfer none): the button area #GtkBox.
 **/
GtkWidget*
gb_nav_bar_get_button_area (GbNavBar *bar)
{
  g_return_val_if_fail (GB_IS_NAV_BAR (bar), NULL);

  return bar->priv->button_area;
}

gboolean
gb_nav_bar_get_hover (GbNavBar *bar)
{
  return bar->priv->hover;
}

/**
* gb_webview_get_pages:
*
* Returns the number of pages.
*
* Returns: (transfer none): value #int.
*/
int      
gb_nav_bar_get_total_pages (GbNavBar *bar)
{
  g_return_val_if_fail (GB_IS_NAV_BAR (bar), NULL);

  return bar->priv->n_pages;
}

void
gb_nav_bar_set_total_pages (GbNavBar   *bar,
                            guint      total_num)
{
  g_return_val_if_fail (GB_IS_NAV_BAR (bar), NULL);
  if (total_num == bar->priv->n_pages) 
  {
    return;
  }
  
  bar->priv->n_pages = total_num + 1;
  gtk_widget_set_sensitive (bar->priv->scale, (total_num > 1));
  gtk_range_set_range (GTK_RANGE (bar->priv->scale), 0.0, total_num);

  //g_object_notify (G_OBJECT (self), "total-number");  
}

/**
* gb_book_state_get_current_page:
*
* Returns the number of pages.
*
* Returns: (transfer none): value #int.
*/
int      
gb_nav_bar_get_current_page (GbNavBar *bar)
{
  g_return_val_if_fail (GB_IS_NAV_BAR (bar), NULL);

  return bar->priv->current_page;
}

void
gb_nav_bar_set_current_page (GbNavBar *bar,
                             guint    curr_page_num)
{
  g_return_val_if_fail (GB_IS_NAV_BAR (bar), NULL);

  if (curr_page_num == bar->priv->current_page) 
  {
    return;
  }
  
  bar->priv->current_page = curr_page_num;
  //g_object_notify (G_OBJECT (self), "current-number");
}

void
gb_nav_bar_update_page (GbNavBar *self,
                        int page)
{
  self->priv->current_page = page;
  update_page_label (self);
  update_scale (self);
}

/**
 * Gb_nav_bar_new:
 * @model: the #EvDocumentModel
 *
 * Creates a new page navigation widget.
 *
 * Returns: a new #GbNavBar object.
 **/
GtkWidget *
gb_nav_bar_new ()
{
  GObject *self;
  self = g_object_new (GB_TYPE_NAV_BAR,
                       "nav-bar",
                       "orientation", GTK_ORIENTATION_HORIZONTAL,
                       NULL);

  return GTK_WIDGET (self);
}
