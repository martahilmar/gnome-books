#!/usr/bin/python

import sys
import zipfile
from lxml import etree

def get_epub_info(fname):
    ns = {
        'n':'urn:oasis:names:tc:opendocument:xmlns:container',
        'pkg':'http://www.idpf.org/2007/opf',
        'dc':'http://purl.org/dc/elements/1.1/'
    }

    zip = zipfile.ZipFile(fname)

    # find the contents metafile
    txt = zip.read('META-INF/container.xml')
    tree = etree.fromstring(txt)
    cfname = tree.xpath('n:rootfiles/n:rootfile/@full-path',namespaces=ns)[0]

    # grab the metadata block from the contents metafile
    cf = zip.read(cfname)
    tree = etree.fromstring(cf)
    p = tree.xpath('/pkg:package/pkg:metadata',namespaces=ns)[0]

    res = {}
    for s in ['title','creator']:
        value = p.xpath('dc:%s/text()'%(s),namespaces=ns)[0]
        if value:
            res[s] = value
        else:
            res[s] = ""
    return res
    
def getTitle():
    print metadata['title']
    
def getAuthor():
	print metadata['creator']
'''
def getLanguage():
    print metadata['language']

def getPublisher():
    print metadata['publisher']

def getRights():
    print metadata['rights']

def getIdentifier():
    print metadata['identifier']
'''
metadata = get_epub_info(sys.argv[1])
eval(sys.argv[2])