ACLOCAL_AMFLAGS = -I build/autotools
DISTCHECK_CONFIGURE_FLAGS = --enable-introspection
SUBDIRS=lib

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
