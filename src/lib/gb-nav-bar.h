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

#ifndef __GB_NAV_BAR_H__
#define __GB_NAV_BAR_H__

#include <gtk/gtk.h>
#include <glib.h>
#include <glib-object.h>

G_BEGIN_DECLS

typedef struct _GbNavBar GbNavBar;
typedef struct _GbNavBarClass GbNavBarClass;
typedef struct _GbNavBarPrivate GbNavBarPrivate;

#define GB_TYPE_NAV_BAR            (gb_nav_bar_get_type ())
#define GB_NAV_BAR(obj)            (G_TYPE_CHECK_INSTANCE_CAST((obj), GB_TYPE_NAV_BAR, GbNavBar))
#define GB_NAV_BAR_CLASS(klass)    (G_TYPE_CHECK_CLASS_CAST((klass),  GB_TYPE_NAV_BAR, GbNavBarClass))
#define GB_IS_NAV_BAR(obj)         (G_TYPE_CHECK_INSTANCE_TYPE((obj), GB_TYPE_NAV_BAR))
#define GB_IS_NAV_BAR_CLASS(klass) (G_TYPE_CHECK_CLASS_TYPE((klass),  GB_TYPE_NAV_BAR))
#define GB_NAV_BAR_GET_CLASS(obj)  (G_TYPE_INSTANCE_GET_CLASS((obj),  GB_TYPE_NAV_BAR, GbNavBarClass))

struct _GbNavBar {
        GtkBox base_instance;

        GbNavBarPrivate *priv;
};

struct _GbNavBarClass {
        GtkBoxClass parent_class;
};

GType           gb_nav_bar_get_type           	(void) G_GNUC_CONST;

GtkWidget*		gb_nav_bar_new                	();
GtkWidget*		gb_nav_bar_get_button_area    	(GbNavBar 	*bar);
gboolean        gb_nav_bar_get_hover          	(GbNavBar   *bar);
void			gb_nav_bar_set_total_pages 		(GbNavBar 	*bar,
                               					 guint      total_num);
int 			gb_nav_bar_get_total_pages 		(GbNavBar 	*bar);
int 			gb_nav_bar_get_current_page 	(GbNavBar 	*bar);
void 			gb_nav_bar_set_current_page 	(GbNavBar 	*bar,
                                				 guint      curr_page_num);
void 			gb_nav_bar_update_page			(GbNavBar 	*self,
             									 int 		page);
G_END_DECLS

#endif /* __GB_NAV_BAR_H__ */
