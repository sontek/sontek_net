Tips and Tricks for the Python Interpreter
==========================================
I have seen a lot of people switch over to using ipython, bpython, etc
to get auto-complete support without realizing that the standard
interpreter does have this functionality.

To enable auto-complete support in the python interpreter you need to
create a python startup file that enables readline support. A python
startup file is just a bunch of python code that gets executed at
startup of the interpreter. To do this you just setup PYTHONSTARTUP in
your ~/.bashrc and then create a ~/.pythonrc.py file:

.. sourcecode:: python

    #.bashrc
    PYTHONSTARTUP=~/.pythonrc.py
    export PYTHONSTARTUP

    #.pythonrc.py
    try:
        import readline
    except ImportError:
        print("Module readline not available.")
    else:
        import rlcompleter
        readline.parse_and_bind("tab: complete")

Now when you are in python you have tab completion on importing, calling
methods on a module, etc.

.. sourcecode:: python

    >>> import o
    object(  oct(     open(    or       ord(     os 

I always end up using the pretty print module for viewing long lists and
strings in the interpreter so I prefer to just use it by default:

.. sourcecode:: python

    # Enable Pretty Printing for stdout
    import pprint
    def my_displayhook(value):
        if value is not None:
            try:
                import __builtin__
                __builtin__._ = value
            except ImportError:
                __builtins__._ = value

            pprint.pprint(value)

    sys.displayhook = my_displayhook

It is also very useful to be able to load up your favorite editor to
edit lines of code from the interpreter, you can do this by adding the
following into your ~/.pythonrc.py:

.. sourcecode:: python

    import os
    import sys
    from code import InteractiveConsole
    from tempfile import mkstemp

    EDITOR = os.environ.get('EDITOR', 'vi')
    EDIT_CMD = '\e'

    class EditableBufferInteractiveConsole(InteractiveConsole):
        def __init__(self, *args, **kwargs):
            self.last_buffer = [] # This holds the last executed statement
            InteractiveConsole.__init__(self, *args, **kwargs)

        def runsource(self, source, *args):
            self.last_buffer = [ source.encode('latin-1') ]
            return InteractiveConsole.runsource(self, source, *args)

        def raw_input(self, *args):
            line = InteractiveConsole.raw_input(self, *args)
            if line == EDIT_CMD:
                fd, tmpfl = mkstemp('.py')
                os.write(fd, b'\n'.join(self.last_buffer))
                os.close(fd)
                os.system('%s %s' % (EDITOR, tmpfl))
                line = open(tmpfl).read()
                os.unlink(tmpfl)
                tmpfl = ''
                lines = line.split( '\n' )
                for i in range(len(lines) - 1): self.push( lines[i] )
                line = lines[-1]
            return line

    c = EditableBufferInteractiveConsole(locals=locals())
    c.interact(banner='')

    # Exit the Python shell on exiting the InteractiveConsole
    sys.exit()

For Django developers when you load up the ./manage.py shell it is nice
to have access to all your models and settings for testing:

.. sourcecode:: python

    # If we're working with a Django project, set up the environment
    if 'DJANGO_SETTINGS_MODULE' in os.environ:
        from django.db.models.loading import get_models
        from django.test.client import Client
        from django.test.utils import setup_test_environment, teardown_test_environment
        from django.conf import settings as S

        class DjangoModels(object):
            """Loop through all the models in INSTALLED_APPS and import them."""
            def __init__(self):
                for m in get_models():
                    setattr(self, m.__name__, m)

        A = DjangoModels()
        C = Client()

After these tweaks the python interpreter is a lot more powerful and you
really lose the need for the more interactive shells like ipython and
bpython. All of these settings work in both python2 and python3.

If you want to see my complete ~/.pythonrc.py you can get it on
`github <https://github.com/sontek/dotfiles/blob/master/_pythonrc.py>`__



.. author:: default
.. categories:: python
.. tags:: python
.. comments::
