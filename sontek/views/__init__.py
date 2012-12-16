from pyramid.response       import FileResponse
from pkg_resources          import resource_filename
from pyramid.view           import view_config
from pyramid.httpexceptions import HTTPMovedPermanently


@view_config(
    route_name='index'
    , renderer='sontek:templates/index.mako'
)
def index(request):
    return {}

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
