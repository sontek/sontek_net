Writing tests for Pyramid and SQLAlchemy
========================================
:category: python
:tags: python, pyramid, sqlalchemy
:date: 2011-12-01

TL;DR:  Putting it all together, the full code can be found here: https://gist.github.com/1420255

============
Intro
============
Pyramid's documentation doesn't cover the preferred way to test with SQLAlchemy, because Pyramid tries to stay out of your way and allow you to make your own decisions. However, I feel i'ts necessary to document what I think is the best way to test.

When I first started writing tests with SQLAlchemy I found plenty of examples of how to to get started by doing something like this:

.. sourcecode:: python

  from db import session # probably a contextbound sessionmaker
  from db import model

  from sqlalchemy import create_engine

  def setup():
      engine = create_engine('sqlite:///test.db')
      session.configure(bind=engine)
      model.metadata.create_all(engine)

  def teardown():
      model.metadata.drop_all(engine)

  def test_something():
      pass

I have seen this done so many times, but I feel there is so much wrong with it! So let's establish some base rules when testing:

  *  Always test your system like it would be used in production.   SQLite does not enforce the same rules or have the same features as Postgres or MySQL and will allow tests to pass that would otherwise fail in production.
  *  Tests should be fast! You should be writing tests for all your code. This is the main reason people do test against SQLite, but we can't violate rule number one. We have to make sure tests against Postgres are fast, so we shouldn't be tearing down and recreating tables for every single test.
  *  You should be able to execute in parallel to speed up when you have thousands of tests. Dropping and creating tables per test would not work in a parallel environment.

For an example, I have a project with 600+ tests and it would take 2 and half minutes to execute running against SQLite. But when we swapped our test configuration to execute against Postgres, testing took well over an hour. That is unacceptable!   

But running them in parallel will give us a huge speed up. Check out the results of the tests running in single proc mode vs using all 4 cores::

    $ py.test
    ======= 616 passed in 143.67 seconds =======

    $ py.test -n4
    ======= 616 passed in 68.12 seconds ======= 


===============
The right way
===============

So what is the proper way to setup your tests? You should initialize the database when you start your test runner and then use transactions to rollback any data changes your tests made. This allows you to keep a clean database for each test in a very efficient way.

In py.test, you just have to create a file called conftest.py that looks similar to:

.. sourcecode:: python

  import os

  ROOT_PATH = os.path.dirname(__file__)

  def pytest_sessionstart():
      from py.test import config

      # Only run database setup on master (in case of xdist/multiproc mode)
      if not hasattr(config, 'slaveinput'):
          from models import initialize_sql
          from pyramid.config import Configurator
          from paste.deploy.loadwsgi import appconfig
          from sqlalchemy import engine_from_config
          import os

          ROOT_PATH = os.path.dirname(__file__)
          settings = appconfig('config:' + os.path.join(ROOT_PATH, 'test.ini'))
          engine = engine_from_config(settings, prefix='sqlalchemy.')

          print 'Creating the tables on the test database %s' % engine

          config = Configurator(settings=settings)
          initialize_sql(settings, config)

With py.test, when you are running in parallel mode, the pytest_sessionstart hook gets fired for each node, so we check that we are on the master node. Then we just grab our test.ini configuration file and execute the initialize_sql function.

Now that you have your initial test configuration finished, you have to define a base test class that does the transaction management in setUp and teardown.

First, lets setup the Base testing class what will manage our transactions:

.. sourcecode:: python

  import unittest
  from pyramid import testing
  from paste.deploy.loadwsgi import appconfig
  
  from webtest import TestApp
  from mock import Mock
  
  from sqlalchemy import engine_from_config
  from sqlalchemy.orm import sessionmaker
  from app.db import Session
  from app.db import Entity  # base declarative object
  from app import main
  import os
  here = os.path.dirname(__file__)
  settings = appconfig('config:' + os.path.join(here, '../../', 'test.ini'))
  
  class BaseTestCase(unittest.TestCase):
      @classmethod
      def setUpClass(cls):
          cls.engine = engine_from_config(settings, prefix='sqlalchemy.')
          cls.Session = sessionmaker()
  
      def setUp(self):
          connection = self.engine.connect()
  
          # begin a non-ORM transaction
          self.trans = connection.begin()
  
          # bind an individual Session to the connection
          Session.configure(bind=connection)
          self.session = self.Session(bind=connection)
          Entity.session = self.session
  
      def tearDown(self):
          # rollback - everything that happened with the
          # Session above (including calls to commit())
          # is rolled back.
          testing.tearDown()
          self.trans.rollback()
          self.session.close()


This base test case will wrap all your sessions in an external transaction so that you still have the ability to call flush/commit/etc and it will still be able to rollback any data changes you make.

============
Unit Tests
============
Now there are a few different types of tests you will want to run. First, you will want to do unit tests, which are small tests that only test 1 thing at a time. This means you will skip the routes, templates, etc. So let's setup our Unit Test Base class:

.. sourcecode:: python

  class UnitTestBase(BaseTestCase):
      def setUp(self):
          self.config = testing.setUp(request=testing.DummyRequest())
          super(UnitTestBase, self).setUp()
  
      def get_csrf_request(self, post=None):
          csrf = 'abc'
  
          if not u'csrf_token' in post.keys():
              post.update({
                  'csrf_token': csrf
              })
  
          request = testing.DummyRequest(post)
  
          request.session = Mock()
          csrf_token = Mock()
          csrf_token.return_value = csrf
  
          request.session.get_csrf_token = csrf_token
  
          return request

We built in a utility function to help us test requests that require a csrf token as well. Here is how we would use this class:

.. sourcecode:: python

  class TestViews(UnitTestBase):
      def test_login_fails_empty(self):
          """ Make sure we can't login with empty credentials"""
          from app.accounts.views import LoginView
          self.config.add_route('index', '/')
          self.config.add_route('dashboard', '/')
  
          request = testing.DummyRequest(post={
              'submit': True,
          })
  
          view = LoginView(request)
          response = view.post()
          errors = response['errors']
  
          assert errors[0].node.name == u'csrf_token'
          assert errors[0].msg == u'Required'
          assert errors[1].node.name == u'Username'
          assert errors[1].msg == u'Required'
          assert errors[2].node.name == u'Password'
          assert errors[2].msg == u'Required'
  
  
      def test_login_succeeds(self):
          """ Make sure we can login """
          admin = User(username='sontek', password='temp', kind=u'admin')
          admin.activated = True
          self.session.add(admin)
          self.session.flush()
  
          from app.accounts.views import LoginView
          self.config.add_route('index', '/')
          self.config.add_route('dashboard', '/dashboard')
  
          request = self.get_csrf_request(post={
                  'submit': True,
                  'Username': 'sontek',
                  'Password': 'temp',
              })
  
          view = LoginView(request)
          response = view.post()
  
          assert response.status_int == 302

=================
Integration Tests
=================
The second type of test you will want to write is an integration test. This will integrate with the whole web framework and actually hit the define routes, render the templates, and actually test the full stack of your application.

Luckily this is pretty easy to do with Pyramid using WebTest:
  
.. sourcecode:: python

  class IntegrationTestBase(BaseTestCase):
      @classmethod
      def setUpClass(cls):
          cls.app = main({}, **settings)
          super(IntegrationTestBase, cls).setUpClass()
  
      def setUp(self):
          self.app = TestApp(self.app)
          self.config = testing.setUp()
          super(IntegrationTestBase, self).setUp()


In setUpClass, we run the main function of the applications __init__.py that sets up the WSGI application and then we wrap it in a TestApp that gives us the ability to call get/post on it.

Here is an example of it in use:

.. sourcecode:: python

  class TestViews(IntegrationTestBase):
      def test_get_login(self):
          """ Call the login view, make sure routes are working """
          res = self.app.get('/login')
          self.assertEqual(res.status_int, 200)
  
      def test_empty_login(self):
          """ Empty login fails """
          res = self.app.post('/login', {'submit': True})
  
          assert "There was a problem with your submission" in res.body
          assert "Required" in res.body
          assert res.status_int == 200
  
      def test_valid_login(self):
          """ Call the login view, make sure routes are working """
          admin = User(username='sontek', password='temp', kind=u'admin')
          admin.activated = True
          self.session.add(admin)
          self.session.flush()
  
          res = self.app.get('/login')
  
          csrf = res.form.fields['csrf_token'][0].value
  
          res = self.app.post('/login', 
              {
                  'submit': True,
                  'Username': 'sontek',
                  'Password': 'temp',
                  'csrf_token': csrf
              }
          )
  
          assert res.status_int == 302


===============================
Problems with this approach
===============================
If a test causes an error that will prevent the transaction from rolling back, such as closing the engine, then this approach will leave your database in a state that might cause other tests to fail. 

If this happens tracing the root cause could be difficult but you should be able to just look at the first failed test unless you are running the tests in parallel.

If you are good about writing and running your tests regularly you should be able to catch individual tests causing issues like this fairly quickly.

===============================
Resources
===============================
`http://docs.pylonsproject.org/projects/pyramid/en/latest/narr/testing.html <http://docs.pylonsproject.org/projects/pyramid/en/latest/narr/testing.html>`_ 

`http://www.sqlalchemy.org/docs/orm/session.html#joining-a-session-into-an-external-transaction <http://www.sqlalchemy.org/docs/orm/session.html#joining-a-session-into-an-external-transaction>`_ 


.. include:: <isonum.txt>

|copy| John Anderson <sontek@gmail.com> 2011


