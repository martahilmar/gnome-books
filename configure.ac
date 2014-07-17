AC_PREREQ(2.69)

AC_INIT([Books], [1.0.0], [])

AC_CONFIG_AUX_DIR([config])
AC_CONFIG_MACRO_DIR([m4])
AC_CONFIG_SRCDIR([lib/gb-webview.c])
AC_CONFIG_HEADER([config/config.h])

GOBJECT_INTROSPECTION_REQUIRE([0.9.6])

AM_INIT_AUTOMAKE([-Wall -Werror foreign])

AC_PROG_CC
AC_LANG_C
AM_PROG_CC_C_O
AC_PROG_CXX
AC_ISC_POSIX
AC_HEADER_STDC

WEBKIT2GTK_MIN_VERSION=1.10.0
GLIB_MIN_VERSION=2.39.3
GTK_MIN_VERSION=3.10.8
GOBJECT_INTROSPECTION_MIN_VERSION=1.31.6

PKG_CHECK_MODULES(DEPEND, 												\
	gtk+-3.0 >= $GTK_MIN_VERSION 										\
	webkit2gtk-3.0 >= $WEBKIT2GTK_MIN_VERSION							\
	gobject-introspection-1.0 >= $GOBJECT_INTROSPECTION_MIN_VERSION)

AC_PROG_CC_STDC

BOOKS_CFLAGS="-Wall"

# library-specific macros
AM_PROG_AR
LT_INIT

GJS_CONSOLE=`$PKG_CONFIG --variable=gjs_console gjs-1.0`
AC_SUBST(GJS_CONSOLE)

# Introspection
GOBJECT_INTROSPECTION_CHECK([1.38.0])

AC_SUBST(BOOKS_CFLAGS)
AC_SUBST(DEPEND_CFLAGS)
AC_SUBST(DEPEND_LIBS)

top_builddir=`pwd`
AC_SUBST(top_builddir)

AC_CONFIG_FILES([
	Makefile 
	lib/Makefile
])

AC_OUTPUT

dnl ==========================================================================
echo "

        gnome-books $VERSION
        ====================

        prefix:    ${prefix}
        compiler:  ${CC}

"