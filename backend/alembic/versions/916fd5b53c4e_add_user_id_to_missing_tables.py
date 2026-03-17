"""add_user_id_to_missing_tables

Revision ID: 916fd5b53c4e
Revises: add_user_id_all_tables
Create Date: 2026-03-17 19:03:57.236834

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '916fd5b53c4e'
down_revision: Union[str, Sequence[str], None] = 'add_user_id_all_tables'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ------------------------------------------------------------------ #
    # Add user_id to remaining tables                                     #
    # ------------------------------------------------------------------ #
    tables = ['client_contacts', 'client_contracts', 'invoices', 'communications']
    
    for table in tables:
        op.add_column(table,
            sa.Column('user_id', sa.Integer(),
                      sa.ForeignKey('users.id'),
                      nullable=True))
        # Set default user_id = 1 for existing data
        op.execute(f"UPDATE {table} SET user_id = 1 WHERE user_id IS NULL")
        op.alter_column(table, 'user_id', nullable=False)


def downgrade() -> None:
    tables = ['client_contacts', 'client_contracts', 'invoices', 'communications']
    for table in tables:
        op.drop_column(table, 'user_id')
