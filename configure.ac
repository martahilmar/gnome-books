dnl -*- mode: m4 -*-
AC_PREREQ(2.69)
AC_INIT([Books], [1.0.0], [])

AC_CONFIG_AUX_DIR([config])
AC_CONFIG_MACRO_DIR([m4])
AC_CONFIG_SRCDIR([src/main.js])
AC_CONFIG_HEADER([config/config.h])

GOBJECT_INTROSPECTION_REQUIRE([0.9.6])

AM_INIT_AUTOMAKE([1.10 no-define foreign dist-xz no-dist-gzip subdir-objects])
AM_MAINTAINER_MODE([enable])

IT_PROG_INTLTOOL([0.40.0])

AC_PROG_CC
AC_LANG_C
AM_PROG_CC_C_O
AC_PROG_CXX
AC_ISC_POSIX
AC_HEADER_STDC

AC_CHECK_LIBM
AC_SUBST(LIBM)

WEBKIT2GTK_MIN_VERSION=1.10.0
GLIB_MIN_VERSION=2.39.3
GTK_MIN_VERSION=3.12
GOBJECT_INTROSPECTION_MIN_VERSION=1.31.6

PKG_CHECK_MODULES(DEPEND, 												\
	gtk+-3.0 >= $GTK_MIN_VERSION 										\
	webkit2gtk-4.0 >= $WEBKIT2GTK_MIN_VERSION							\
	gobject-introspection-1.0 >= $GOBJECT_INTROSPECTION_MIN_VERSION		\
	gjs-1.0)

AC_PROG_CC_STDC

BOOKS_CFLAGS="-Wall"

# library-specific macros
m4_ifdef([AM_PROG_AR], [AM_PROG_AR])
LT_INIT

LIBGD_INIT([
  gtk-hacks
  main-view
  notification
  tagged-entry
  gir
])

GJS_CONSOLE=`$PKG_CONFIG --variable=gjs_console gjs-1.0`
AC_SUBST(GJS_CONSOLE)

GLIB_COMPILE_RESOURCES=`$PKG_CONFIG --variable glib_compile_resources gio-2.0`
AC_SUBST(GLIB_COMPILE_RESOURCES)

AC_SUBST(BOOKS_CFLAGS)
AC_SUBST(DEPEND_CFLAGS)
AC_SUBST(DEPEND_LIBS)

top_builddir=`pwd`
AC_SUBST(top_builddir)

GLIB_GSETTINGS

AC_CONFIG_FILES([
	Makefile
  data/Makefile
  libgd/Makefile
	src/Makefile
  po/Makefile.in
])

AC_OUTPUT

dnl ==========================================================================
echo "

        gnome-books $VERSION
        ====================

        prefix:    ${prefix}
        compiler:  ${CC}

"
