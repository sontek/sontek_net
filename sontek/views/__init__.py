from pyramid.response       import FileResponse
from pkg_resources          import resource_filename
from pyramid.view           import view_config


@view_config(
    route_name='sontek_index'
    , renderer='sontek:templates/index.mako'
)
def index(request):
    return {}

def favicon_view(request):
    fname = resource_filename(__name__, '../static/favicon.ico')
    return FileResponse(fname, request=request)
