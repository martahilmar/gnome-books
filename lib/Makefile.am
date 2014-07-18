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
bin_PROGRAMS =

gb_cflags =               \
  -I$(top_srcdir)         \
  -I$(top_srcdir)/lib

gb_source_h =             \
  gb-webview.h            \
  $(NULL)

gb_source_c =             \
  gb-webview.c            \
  gb-resources.c          \
  $(NULL)

# Defines the library to build.
lib_LTLIBRARIES += libgbWebView-1.0.la

libgbWebView_1_0_la_LIBADD = $(DEPEND_LIBS)

libgbWebView_1_0_la_LDFLAGS = -avoid-version
libgbWebView_1_0_la_CPPFLAGS = $(gb_cflags)
libgbWebView_1_0_la_SOURCES = $(gb_source_c) $(gb_source_h)

-include $(INTROSPECTION_MAKEFILE)

INTROSPECTION_GIRS = Gb_1_0_gir
INTROSPECTION_SCANNER_ARGS = --add-include-path=$(srcdir) --warn-all
INTROSPECTION_COMPILER_ARGS =

if HAVE_INTROSPECTION
introspection_sources = $(libgbWebView_1_0_la_SOURCES)

INTROSPECTION_GIRS += Gb-1.0.gir

Gb-1.0.gir: libgbWebView-1.0.la Makefile
Gb_1_0_gir_NAMESPACE = Gb
Gb_1_0_gir_VERSION = 1.0
Gb_1_0_gir_LIBS = libgbWebView-1.0.la
Gb_1_0_gir_CFLAGS = $(AM_CPPFLAGS) $(gb_cflags)
Gb_1_0_gir_SCANNERFLAGS = --warn-all --symbol-prefix=gb --identifier-prefix=Gb
Gb_1_0_gir_INCLUDES = \
  GObject-2.0 \
  Gtk-3.0 \
  WebKit2-3.0
Gb_1_0_gir_FILES = $(introspection_sources)

girdir = $(datadir)/gir-1.0
gir_DATA = $(INTROSPECTION_GIRS)

typelibdir = $(libdir)/girepository-1.0
typelib_DATA = $(INTROSPECTION_GIRS:.gir=.typelib)

CLEANFILES += $(gir_DATA) $(typelib_DATA)
endif

-include $(top_srcdir)/git.mk