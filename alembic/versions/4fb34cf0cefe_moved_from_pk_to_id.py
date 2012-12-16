"""Moved from 'pk' to 'id'

Revision ID: 4fb34cf0cefe
Revises: None
Create Date: 2012-12-16 14:33:39.600140

"""

# revision identifiers, used by Alembic.
revision = '4fb34cf0cefe'
down_revision = None

from alembic import op
import sqlalchemy as sa


def upgrade():
    op.alter_column(u'activation', u'pk', name=u'id')
    op.alter_column(u'entry', u'pk', name=u'id')
    op.alter_column(u'category', u'pk', name=u'id')
    op.alter_column(u'series', u'pk', name=u'id')
    op.alter_column(u'entry_tag', u'pk', name=u'id')
    op.alter_column(u'entry_tag_association', u'pk', name=u'id')
    op.alter_column(u'group', u'pk', name=u'id')
    op.alter_column(u'user_group', u'user_pk', name=u'user_id')
    op.alter_column(u'user_group', u'group_pk', name=u'group_id')
    op.alter_column(u'user_group', u'pk', name=u'id')
    op.alter_column(u'user', u'user_name', name=u'username')
    op.alter_column(u'user', u'activation_pk', name=u'activation_id')
    op.alter_column(u'user', u'pk', name=u'id')

    op.alter_column(u'entry', u'series_pk', name=u'series_id')
    op.alter_column(u'entry', u'category_pk', name=u'category_id')
    op.alter_column(u'entry', u'owner_pk', name=u'owner_id')
    op.alter_column(u'entry_association', u'related_entry_pk', name=u'related_entry_id')
    op.alter_column(u'entry_association', u'parent_entry_pk', name=u'parent_entry_id')
    op.alter_column(u'entry_tag_association', u'entry_pk', name=u'entry_id')
    op.alter_column(u'entry_tag_association', u'tag_pk', name=u'tag_id')


def downgrade():
    op.alter_column(u'activation', u'id', name=u'pk')
    op.alter_column(u'entry', u'id', name=u'pk')
    op.alter_column(u'category', u'id', name=u'pk')
    op.alter_column(u'series', u'id', name=u'pk')
    op.alter_column(u'entry_tag', u'id', name=u'pk')
    op.alter_column(u'entry_tag_association', u'id', name=u'pk')
    op.alter_column(u'group', u'id', name=u'pk')
    op.alter_column(u'user_group', u'id', name=u'pk')
    op.alter_column(u'user_group', u'user_id', name=u'user_pk')
    op.alter_column(u'user_group', u'group_id', name=u'group_pk')
    op.alter_column(u'user_group', u'id', name=u'pk')
    op.alter_column(u'user', u'user_name', name=u'username')
    op.alter_column(u'user', u'activation_id', name=u'activation_pk')
    op.alter_column(u'user', u'id', name=u'pk')

    op.alter_column(u'entry', u'series_id', name=u'series_pk')
    op.alter_column(u'entry', u'category_id', name=u'category_pk')
    op.alter_column(u'entry', u'owner_id', name=u'owner_pk')
    op.alter_column(u'entry_association', u'related_entry_id', name=u'related_entry_pk')
    op.alter_column(u'entry_association', u'parent_entry_id', name=u'parent_entry_pk')
    op.alter_column(u'entry_tag_association', u'entry_id', name=u'entry_pk')
    op.alter_column(u'entry_tag_association', u'tag_id', name=u'tag_pk')
