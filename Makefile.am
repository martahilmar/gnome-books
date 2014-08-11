ACLOCAL_AMFLAGS = -I m4 -I libgd ${ACLOCAL_FLAGS}
DISTCHECK_CONFIGURE_FLAGS = --enable-introspection
SUBDIRS=libgd src

MAINTAINERCLEANFILES = \
    $(srcdir)/AUTHORS \
    $(srcdir)/INSTALL \
    $(srcdir)/ar-lib \
    $(srcdir)/aclocal.m4 \
    $(srcdir)/autoscan.log \
    $(srcdir)/compile \
    $(srcdir)/config.guess \
    $(srcdir)/config.h.in \
    $(srcdir)/config.sub \
    $(srcdir)/configure.scan \
    $(srcdir)/depcomp \
    $(srcdir)/install-sh \
    $(srcdir)/ltmain.sh \
    $(srcdir)/missing \
    $(srcdir)/mkinstalldirs \
    $(srcdir)/omf.make \
    $(srcdir)/xmldocs.make \
    $(srcdir)/gtk-doc.make \
    $(NULL)

GITIGNOREFILES =    \
    m4              \
    config          \
    node_modules    \
    $(NULL)

-include $(top_srcdir)/git.mk