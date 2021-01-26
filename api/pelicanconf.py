#!/usr/bin/env python
# -*- coding: utf-8 -*- #

AUTHOR = 'John Anderson (sontek)'
SITENAME = 'sontek.net blog'
SITEURL = '/blog/'

PATH = 'blog_posts'
THEME = './pelican_theme/'
TIMEZONE = 'America/Puerto_Rico'
# Pretty URLs
ARTICLE_SAVE_AS = '{date:%Y}/{slug}/index.html'
ARTICLE_URL = '{date:%Y}/{slug}'
DEFAULT_LANG = 'en'

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

# Blogroll
LINKS = (('Pelican', 'https://getpelican.com/'),
         ('Python.org', 'https://www.python.org/'),
         ('Jinja2', 'https://palletsprojects.com/p/jinja/'),
         ('You can modify those links in your config file', '#'),)

# Social widget
SOCIAL = (('You can add links in your config file', '#'),
          ('Another social link', '#'),)

DEFAULT_PAGINATION = False

# Uncomment following line if you want document-relative URLs when developing
#RELATIVE_URLS = True
