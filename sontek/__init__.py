from pyramid.config     import Configurator
from sontek.models      import DBSession
from hem.interfaces     import IDBSession
from sqlalchemy         import engine_from_config

def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(settings=settings)

    engine = engine_from_config(settings, 'sqlalchemy.')
    DBSession.configure(bind=engine)

    config.registry.registerUtility(DBSession, IDBSession)

    config.include('sontek.routes')
    config.scan()
    return config.make_wsgi_app()
