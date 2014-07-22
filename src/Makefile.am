AM_CPPFLAGS =               \
  -I$(top_builddir)/config  \
  -I$(top_srcdir)           \
  -L$(top_srcdir)           \
  $(GTK_DEBUG_FLAGS)        \
  $(GTK_DEP_CFLAGS)

AM_CFLAGS = $(DEPEND_CFLAGS) -Wall

AM_LDFLAGS = $(DEPEND_LIBS)

# preamble
NULL =
BUILT_SOURCES =
CLEANFILES =
EXTRA_DIST =
DISTCLEANFILES =
lib_LTLIBRARIES =
bin_SCRIPTS =
libexec_PROGRAMS =
libexec_SCRIPTS =

# convenience command for doing Makefile variable substitutions in non-Makefile
# files (scripts, service files, etc.)
do_subst = sed -e 's|@abs_top_srcdir[@]|$(abs_top_srcdir)|g'      \
               -e 's|@abs_top_builddir[@]|$(abs_top_builddir)|g'  \
               -e 's|@localedir[@]|$(localedir)|g'                \
               -e 's|@bindir[@]|$(bindir)|g'                      \
               -e 's|@libdir[@]|$(libdir)|g'                      \
               -e 's|@libexecdir[@]|$(libexecdir)|g'              \
               -e 's|@pkglibdir[@]|$(pkglibdir)|g'                \
               -e 's|@pkgdatadir[@]|$(pkgdatadir)|g'              \
               -e 's|@GJS_CONSOLE[@]|$(GJS_CONSOLE)|g'            \
               -e 's|@PACKAGE_NAME[@]|$(PACKAGE_NAME)|g'          \
               -e 's|@PACKAGE_VERSION[@]|$(PACKAGE_VERSION)|g'    \
               -e 's|@GETTEXT_PACKAGE[@]|$(GETTEXT_PACKAGE)|g'

-include $(INTROSPECTION_MAKEFILE)
include Makefile-lib.am
include Makefile-js.am

girdir = $(datadir)/gir-1.0
gir_DATA = $(INTROSPECTION_GIRS)

typelibdir = $(libdir)/girepository-1.0
typelib_DATA = $(INTROSPECTION_GIRS:.gir=.typelib)

CLEANFILES += $(gir_DATA) $(typelib_DATA)

service_in_files = org.gnome.Books.service.in
servicedir = $(datadir)/dbus-1/services
service_DATA = org.gnome.Books.service
org.gnome.Books.service: org.gnome.Books.service.in
	$(AM_V_GEN) $(do_subst) $< > $@

CLEANFILES += $(service_DATA)
EXTRA_DIST += $(service_in_files)

bin_SCRIPTS += gnome-books
gnome-books: gnome-books.in
	$(AM_V_GEN) $(do_subst) $< > $@ 
	chmod +x $@

CLEANFILES += gnome-books
EXTRA_DIST += gnome-books.in

-include $(top_srcdir)/git.mk
