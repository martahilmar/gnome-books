# preamble
NULL =
AM_CPPFLAGS =
AM_CFLAGS =
BUILT_SOURCES =
CLEANFILES =
EXTRA_DIST =
DISTCLEANFILES =
lib_LTLIBRARIES =
bin_PROGRAMS =

# C Preprocessor flags - GOBJECT_CFLAGS was defined by PKG_CHECK_MODULES
AM_CPPFLAGS += \
  $(GOBJECT_CFLAGS) \
  $(NULL)

# CFlags - we defined GB_CFLAGS with AC_SUBST
AM_CFLAGS += \
  $(GB_CFLAGS) \
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

# Now define the GIR file to make. This is an XML file that shows how the
# introspection utilities interpreted your source code. You should read this file
# to make sure everything was interpreted as you expected.
-include $(INTROSPECTION_MAKEFILE)

# Make sure the name of your library matches the name you defined in
# lib_LTLIBRARIES. Capitalization can be important in these steps.
INTROSPECTION_GIRS = GbPrivate_1_0_gir
# These are flags to pass to g-ir-scanner and g-ir-compiler.
INTROSPECTION_SCANNER_ARGS = --add-include-path=$(srcdir) --warn-all
INTROSPECTION_COMPILER_ARGS =

if HAVE_INTROSPECTION
introspection_sources = $(libgbWebView_1_0_la_SOURCES)

# This step is fairly well documented in the Gnome wiki here:
# https://wiki.gnome.org/Projects/GObjectIntrospection/AutotoolsIntegration
GbPrivate-1.0.gir: libgbWebView-1.0.la
GbPrivate_1_0_gir_INCLUDES = GObject-2.0
GbPrivate_1_0_gir_CFLAGS = $(AM_CPPFLAGS)
GbPrivate_1_0_gir_PACKAGES =
GbPrivate_1_0_gir_LIBS = libgbWebView-1.0.la
GbPrivate_1_0_gir_FILES = $(introspection_sources)
GbPrivate_1_0_gir_NAMESPACE = Gb
INTROSPECTION_GIRS += GbPrivate-1.0.gir

girdir = $(datadir)/gir-1.0
gir_DATA = $(INTROSPECTION_GIRS)

typelibdir = $(libdir)/girepository-1.0
typelib_DATA = $(INTROSPECTION_GIRS:.gir=.typelib)

CLEANFILES += $(gir_DATA) $(typelib_DATA)
endif