#!/usr/bin/env bash
if [ -d $2 ]
  then
    rm -r $2
fi

mkdir $2
cp $1 $2/book.epub

cd $2
unzip book.epub