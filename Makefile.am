ACLOCAL_AMFLAGS = -I m4 ${ACLOCAL_FLAGS}
DISTCHECK_CONFIGURE_FLAGS = --enable-introspection
EXTRA_DIST = m4/introspection.m4
SUBDIRS=lib m4

stale-files-clean-local:
	-$(RM) $(abs_top_builddir)/*.la $(abs_top_builddir)/*.gir $(abs_top_builddir)/*.typelib

MAINTAINERCLEANFILES = \
    $(srcdir)/INSTALL \
    $(srcdir)/aclocal.m4 \
    $(srcdir)/autoscan.log \
    $(srcdir)/compile \
    $(srcdir)/config.guess \
    $(srcdir)/config.h.in \
    $(srcdir)/config.sub \
    $(srcdir)/configure.scan \
    $(srcdir)/install-sh \
    $(NULL)

GITIGNOREFILES = \
    m4 \
    config \
    $(NULL)

-include $(top_srcdir)/git.mk
