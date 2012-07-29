from pyramid.config         import Configurator
from sontek.models          import DBSession
from hem.interfaces         import IDBSession
from horus                  import groupfinder
from sqlalchemy             import engine_from_config
from pyramid.authentication import AuthTktAuthenticationPolicy
from pyramid.authorization  import ACLAuthorizationPolicy

def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    authentication_policy = AuthTktAuthenticationPolicy('seekrit',
            callback=groupfinder)
    authorization_policy = ACLAuthorizationPolicy()
    config = Configurator(
        settings = settings
        , authentication_policy = authentication_policy
        , authorization_policy=authorization_policy
    )

    engine = engine_from_config(settings, 'sqlalchemy.')

    DBSession.configure(bind=engine)

    config.registry.registerUtility(DBSession, IDBSession)

    config.override_asset(
        to_override='hiero:templates/blog_index.mako',
        override_with='sontek:templates/blog_index.mako'
    )

    config.override_asset(
        to_override='hiero:templates/entry_detail.mako',
        override_with='sontek:templates/entry_detail.mako'
    )

    config.include('sontek.routes')

    config.scan()
    return config.make_wsgi_app()
