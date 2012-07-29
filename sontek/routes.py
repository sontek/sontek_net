def includeme(config):
    config.add_static_view('static', 'static', cache_max_age=3600)

    config.add_route('favicon', '/favicon.ico')
    config.add_route('index', '')
    config.add_view('sontek.views.favicon_view', route_name='favicon')

    config.include('horus', route_prefix='auth')
    config.include('hiero', route_prefix='blog')
