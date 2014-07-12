dnl -*- mode: m4 -*-
AC_PREREQ(2.69)

AC_INIT([gnome-books], [1.0.0], [], [gnome-books])

AM_MAINTAINER_MODE([enable])

AC_CONFIG_HEADER([config/config.h])
AC_CONFIG_SRCDIR([gnome-books.js])
AC_CONFIG_MACRO_DIR([m4])
AC_CONFIG_AUX_DIR([config])

GOBJECT_INTROSPECTION_REQUIRE([0.9.6])

## don't rerun to this point if we abort
AC_CACHE_SAVE

# Checks for programs

AC_PROG_CC
AC_PROG_INSTALL

# Checks for libraries

WEBKITGTK_MIN_VERSION=1.10.0
GLIB_MIN_VERSION=2.39.3
GTK_MIN_VERSION=3.10.8
GOBJECT_INTROSPECTION_MIN_VERSION=1.31.6

# Define the GOBJECT_CFLAGS and GOBJECT_LIBS variables which are useful
# in the Makefile.am files
PKG_CHECK_MODULES(BOOKS,
                  webkit2gtk-3.0 >= $WEBKITGTK_MIN_VERSION
                  gjs-1.0
                  glib-2.0 >= $GLIB_MIN_VERSION
                  gobject-introspection-1.0 >= $GOBJECT_INTROSPECTION_MIN_VERSION
                  gtk+-3.0 >= $GTK_MIN_VERSION)

# Checks for typedefs, structures, and compiler characteristics

# Adds the latest standard flag (e.g. std=gnu99) to the compiler flags
# AC_PROG_CC_STDC

# Compiler flags (you might need to do some checks and set these conditionally)
GB_CFLAGS="-Wall"

AM_INIT_AUTOMAKE([-Wall -Werror foreign])

# library-specific macros
AM_PROG_AR
LT_INIT
AC_CHECK_FUNCS([atexit])
AC_CHECK_HEADERS([stdlib.h string.h unistd.h])

# Output

# Exposes the GB_CFLAGS variable to the Makefile.am files.
AC_SUBST(GB_CFLAGS)

# You should generally have one entry here for each Makefile.am
AC_CONFIG_FILES([
Makefile 
lib/Makefile
])

AC_OUTPUT

dnl ==========================================================================
echo "
        gnome-books $VERSION
        ==================

        prefix:    ${prefix}
        compiler:  ${CC}
"