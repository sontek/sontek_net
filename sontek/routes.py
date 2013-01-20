def includeme(config):
    # bad routes
    # these are used to catch popular links that are invalid
    config.add_route('bad_link_gevent', '/blog/detail/pycon-sprints-part-1-the-realtime-web-with-gevent')

    config.add_static_view('static', 'static', cache_max_age=3600)

    config.add_route('favicon', '/favicon.ico')
    config.add_route('index', '/')
    config.add_route('resume', '/resume')
    config.add_route('resume.html', '/resume.html')
    config.add_route('about', '/about')
    config.add_route('projects', '/projects')
    config.add_view('sontek.views.favicon_view', route_name='favicon')

    config.include('horus', route_prefix='auth')
    config.include('hiero', route_prefix='blog')

    # this is last, should only match things not grabbed by horus or hiero
    config.add_route('old_detail', '/{slug}')
