import os

from setuptools import setup, find_packages

here = os.path.abspath(os.path.dirname(__file__))
README = open(os.path.join(here, 'README.txt')).read()
CHANGES = open(os.path.join(here, 'CHANGES.txt')).read()

requires = [
    'pyramid'
    , 'beaker'
    , 'pyramid_beaker'
    , 'pyramid_debugtoolbar'
    , 'waitress'
    , 'sqlalchemy'
    , 'gunicorn'
    , 'hiero'
    , 'hem'
    , 'horus'
    , 'deform_bootstrap'
]

setup(name='sontek',
    version='0.0',
    description='sontek',
    long_description=README + '\n\n' +  CHANGES,
    classifiers=[
    "Programming Language :: Python",
    "Framework :: Pylons",
    "Topic :: Internet :: WWW/HTTP",
    "Topic :: Internet :: WWW/HTTP :: WSGI :: Application",
    ],
    author='',
    author_email='',
    url='',
    keywords='web pyramid pylons',
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    install_requires=requires,
    tests_require=requires,
    test_suite="sontek",
    entry_points = """\
    [paste.app_factory]
    main = sontek:main
    [console_scripts]
    init_sontek_db = sontek.scripts.initializedb:main
    migrate_from_tekblog = sontek.scripts.migrate_from_tekblog:main
    """,
)

