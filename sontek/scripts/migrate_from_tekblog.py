import os
import sys
import transaction

from hiero.formatters       import get_formatter
from getpass                import getpass
from sqlalchemy             import engine_from_config
from sqlalchemy             import create_engine
from datetime               import datetime

from pyramid.paster import (
    get_appsettings,
    setup_logging,
)

from ..models import (
    DBSession
    , Base
    , Entry
    , User
)

def usage(argv):
    cmd = os.path.basename(argv[0])
    print('usage: %s <config_uri>\n'
          '(example: "%s development.ini")' % (cmd, cmd)) 
    sys.exit(1)

def main(argv=sys.argv):
    if len(argv) != 2:
        usage(argv)
    config_uri = argv[1]
    setup_logging(config_uri)
    settings = get_appsettings(config_uri)

    engine = engine_from_config(settings, 'sqlalchemy.')
    engine2 = create_engine('postgresql://localhost/old_sontek')
    DBSession.configure(bind=engine)
    Base.metadata.create_all(engine)

    conn = engine2.connect()
    query = """
        SELECT title, slug, content, published_on, draft, markup
        FROM tekblog_entry
    """
    results = conn.execute(query)

    username = raw_input("What is your username?: ").decode('utf-8')
    email = raw_input("What is your email?: ").decode('utf-8')
    password = getpass("What is your password?: ").decode('utf-8')


    with transaction.manager:
        admin = User(
            user_name = username
            , email=email
        )

        admin.set_password(password)

        DBSession.add(admin)

        for result in results:
            markup = ''

            if result.markup:
                if result.markup.lower() == 'mrk':
                    markup = 'markdown'
                elif result.markup.lower() == 'restructuredtextformatter':
                    markup = 'rst'
                else:
                    markup = result.markup.lower()

            entry = Entry(
                title=result.title
                , content = result.content
                , published_on = datetime.utcnow()
                , markup = markup
                , owner = admin
            )

            if entry.published_on:
                entry.is_published = True

            formatter = get_formatter(entry.markup)

            if entry.markup == 'markdown':
                lines = []
                in_code = False

                for line in entry.content.split('\n'):
                    if '</code>' in line:
                        lines.append('\n')
                        lines.append('')
                        in_code = False

                    elif '<code' in line:
                        in_code = True

                        if 'class' in line:
                            cls = line.split('class=')[1].replace('"', '')
                            cls = cls.replace("'", '').replace(')', '')
                            cls = cls.replace(">", '')
                            lines.append('\n\n    :::%s\n' % cls)
                        else:
                            lines.append('\n\n    :::\n')

                    elif in_code:
                        line = '    ' + line
                        lines.append(line)
                    else:
                        lines.append(line)

                entry.content = ''.join(lines)

            if formatter:
                entry.html_content = formatter(entry.content).get_html()
            else:
                entry.html_content = entry.content

            DBSession.add(entry)

        transaction.commit()
