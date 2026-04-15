"""add magic link fields to clients

Revision ID: b625599df9cf
Revises: 916fd5b53c4e
Create Date: 2026-04-15 13:05:53.082432

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b625599df9cf'
down_revision: Union[str, Sequence[str], None] = '916fd5b53c4e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('clients', sa.Column('magic_link_token', sa.String(), nullable=True))
    op.add_column('clients', sa.Column('magic_link_password', sa.String(), nullable=True))
    op.add_column('clients', sa.Column('magic_link_expires_at', sa.DateTime(), nullable=True))
    op.create_index(op.f('ix_clients_magic_link_token'), 'clients', ['magic_link_token'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_clients_magic_link_token'), table_name='clients')
    op.drop_column('clients', 'magic_link_expires_at')
    op.drop_column('clients', 'magic_link_password')
    op.drop_column('clients', 'magic_link_token')
