# GNOME Books

Google Summer of Code project for GNOME

gnome-books is application for listing, searching and reading eBooks.

The idea is to integrate gnome-books with an existing online eBook store.

gnome-books will be implemented upon the application gnome-documents, and it is going to live in the same git repository. This would be a great solution regarding code duplication, because it would be possible to reuse relevant code blocks from gnome-documents and add extra features related to eBooks.

Using epub.js library for the reading mode.


## 1. Installing GNOME Books

    $ make
    $ export LD_LIBRARY_PATH=`pwd`/.libs:$LD_LIBRARY_PATH
    $ export GI_TYPELIB_PATH=`pwd`

## 2. Running GNOME Books

    $ gjs gnome-books.js
