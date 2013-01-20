from pyramid.response       import FileResponse
from pkg_resources          import resource_filename
from pyramid.view           import view_config
from pyramid.httpexceptions import HTTPMovedPermanently

from sontek.models          import Entry

import os
import json

here = os.path.dirname(__file__)

@view_config(
    route_name='index'
    , renderer='sontek:templates/index.mako'
)
def index(request):
    query = Entry.get_all_active(request)[:10]

    return {
        'entries': query
    }

@view_config(
    route_name='about'
    , renderer='sontek:templates/about.mako'
)
def about(request):
    return {}

@view_config(
    route_name='resume'
    , renderer='sontek:templates/resume.mako'
)
def resume(request):
    with open(os.path.join(here, '../static/resume.json')) as f:
        content = f.read()
        data = json.loads(content)
        dev = data['developer']
        contact = data['contact']
        preamble = data['preamble']
        catalog = data['catalog']
        experience = data['experiences']

    return dict(
        dev=dev
        , contact=contact
        , preamble=preamble
        , catalog=catalog
        , experience=experience
    )


@view_config(
    route_name='projects'
    , renderer='sontek:templates/projects.mako'
)
def projects(request):
    projects = [
        dict(
            name="PyQuil"
            , description="A Python/GTK SQL query application. Allows you to inspect your databases and query them easily."
            , tags = ["Python", "GTK", "SQLAlchemy"]
            , url = "https://github.com/sontek/PyQuil"
            , screenshot = "pyquil.png"
        )
        , dict(
            name="gevent-socketio"
            , description="""A WebSocket-like abstraction that
            enables real-time communication between a browser and a gevent
            server. I'm co-maintainer"""
            , tags = ["Python", "gevent", "socket.io"]
            , url = "https://github.com/abourget/gevent-socketio"
        )
        , dict(
            name="SQLAlchemy Traversal"
            , description="Automatically generate REST API from SQLAlchemy models"
            , tags = ["Python", "Pyramid", "SQLAlchemy", "Mako"]
            , url = "https://github.com/sontek/sqlalchemy_traversal"
        )
        , dict(
            name="Hiero"
            , description="Generic blog engine written in Pyramid, Mako, and SQLAlchemy"
            , tags = ["Python", "Pyramid", "SQLAlchemy", "Mako"]
            , url = "https://github.com/sontek/hiero"
        )
        , dict(
            name="Horus"
            , description="Generic user authentication and registration library for Pyramid"
            , tags = ["Python", "Pyramid", "SQLAlchemy", "Mako"]
            , url = "https://github.com/sontek/horus"
        )
        , dict(
            name="Snowjob"
            , description="""A cross platform (Linux, Mac, Windows, Android)
            script that makes your terminal snow. Python2 and Python3 compatible.
            """
            , tags = ["Python"]
            , url = "https://github.com/sontek/snowjob"
            , screenshot = "snowjob.png"
        )
        , dict(
            name="Pyramid Mustache"
            , description="""A Pyramid renderer for the mustache templating
            language. Allows you to share client and server templates"""
            , tags = ["Python", "Pyramid", "Javascript"]
            , url = "https://github.com/sontek/pyramid_mustache"
        )
        , dict(
            name="OAuth2 Client"
            , description="""A small OAuth2 client compatible with the final
            draft"""
            , tags = ["Python", "OAuth2"]
            , url = "https://github.com/sontek/oauth2_client"
        )
        , dict(
            name="OAuth2 Provider"
            , description="""A small OAuth2 generic provider compatible with
            the final draft, works with any web framework."""
            , tags = ["Python", "OAuth2"]
            , url = "https://github.com/sontek/oauth2_provider"
        )
        , dict(
            name="Pymemmon"
            , description="""A small python script that will monitor memory
            usage and kill processes if they reach the max. Can e-mail alerts.
            """
            , tags = ["Python"]
            , url = "https://github.com/sontek/pymemmon"
        )
    ]

    return {
        'projects': projects
    }

@view_config(
    route_name='bad_link_gevent'
)
def bad_link_gevent(request):
    return HTTPMovedPermanently(
        location = request.route_url(
            'hiero_entry_detail'
            , slug='pycon-sprints-part-1-the-realtime-web-with-gevent-socket-io-redis-and-django'
        )
    )

@view_config(
    route_name='old_detail'
)
def old_detail(request):
    slug = request.matchdict.get('slug')

    return HTTPMovedPermanently(
        location = request.route_url(
            'hiero_entry_detail'
            , slug=slug
        )
    )

def favicon_view(request):
    fname = resource_filename(__name__, '../static/favicon.ico')
    return FileResponse(fname, request=request)
