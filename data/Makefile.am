appdatadir = $(datadir)/appdata
appdata_DATA = $(appdata_in_files:.xml.in=.xml)
appdata_in_files = org.gnome.Books.appdata.xml.in

@INTLTOOL_XML_RULE@

desktopdir = $(datadir)/applications
desktop_DATA = $(desktop_in_files:.desktop.in=.desktop)
desktop_in_files = org.gnome.Books.desktop.in

searchproviderdir = $(datadir)/gnome-shell/search-providers
searchprovider_DATA = org.gnome.Books.search-provider.ini

@INTLTOOL_DESKTOP_RULE@

check-local: org.gnome.Books.desktop
	$(DESKTOP_FILE_VALIDATE) org.gnome.Books.desktop

gsettings_ENUM_NAMESPACE = org.gnome.Books
gsettings_ENUM_FILES = \
    $(top_srcdir)/libgd/libgd/gd-main-view.h

gsettings_SCHEMAS = org.gnome.books.gschema.xml
.PRECIOUS: $(gsettings_SCHEMAS)

@GSETTINGS_RULES@

EXTRA_DIST= \
    $(appdata_in_files) \
    $(desktop_in_files) \
    $(searchprovider_DATA) \
    $(gsettings_SCHEMAS)

CLEANFILES = \
    $(appdata_DATA) \
    $(desktop_DATA)

-include $(top_srcdir)/git.mk
