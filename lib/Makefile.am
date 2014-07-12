# preamble
NULL =
AM_CPPFLAGS =
BUILT_SOURCES =
CLEANFILES =
EXTRA_DIST =
DISTCLEANFILES =
lib_LTLIBRARIES =
bin_PROGRAMS =

# C Preprocessor flags - GOBJECT_CFLAGS was defined by PKG_CHECK_MODULES
AM_CPPFLAGS += \
  -I$(top_builddir)/config \
  -I$(top_srcdir)	\
  $(GOBJECT_CFLAGS) \
  $(NULL)

# Define source C and header files. Note that a few variables have been defined
# for you such as `top_srcdir` and `srcdir` which are convenient to use.
source_h = \
  $(top_srcdir)/lib/gb-webview.h \
  $(NULL)

source_c = \
  gb-webview.c \
  gb-resources.c \
  $(NULL)

# Defines the actual library to build.
lib_LTLIBRARIES += libgbWebView-1.0.la

# There are now several libgbWebView_1_0_la_* variables you can define to control
# additional library objects to include, source files, linker objects, etc.
# There is also a similar variable, bin_PROGRAMS, you can define here to define
# any programs you want to build.
libgbWebView_1_0_la_LIBADD = $(GOBJECT_LIBS)
libgbWebView_1_0_la_SOURCES = $(source_c) $(source_h)

-include $(INTROSPECTION_MAKEFILE)

# Make sure the name of your library matches the name you defined in
# lib_LTLIBRARIES. Capitalization can be important in these steps.
INTROSPECTION_GIRS = Gb_1_0_gir
# These are flags to pass to g-ir-scanner and g-ir-compiler.
INTROSPECTION_SCANNER_ARGS = --add-include-path=$(srcdir)
INTROSPECTION_COMPILER_ARGS = --includedir=$(srcdir)

if HAVE_INTROSPECTION
introspection_sources = $(libgbWebView_1_0_la_SOURCES)

# This step is fairly well documented in the Gnome wiki here:
# https://wiki.gnome.org/Projects/GObjectIntrospection/AutotoolsIntegration
Gb-1.0.gir: libgbWebView-1.0.la
Gb_1_0_gir_NAMESPACE = Gb
Gb_1_0_gir_VERSION = 1.0
Gb_1_0_gir_INCLUDES = GObject-2.0 WebKit2-3.0 Gtk-3.0
Gb_1_0_gir_CFLAGS = $(AM_CPPFLAGS)
Gb_1_0_gir_PACKAGES =
Gb_1_0_gir_LIBS = libgbWebView-1.0.la
Gb_1_0_gir_FILES = $(introspection_sources)
GdPrivate_1_0_gir_SCANNERFLAGS = --warn-all --symbol-prefix=gb --identifier-prefix=Gb

girdir = $(datadir)/gir-1.0
gir_DATA = $(INTROSPECTION_GIRS)

typelibdir = $(libdir)/girepository-1.0
typelib_DATA = $(INTROSPECTION_GIRS:.gir=.typelib)

CLEANFILES += $(gir_DATA) $(typelib_DATA)

endif
-include $(top_srcdir)/git.mk
