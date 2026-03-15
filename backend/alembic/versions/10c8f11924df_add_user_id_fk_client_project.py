"""add_user_id_fk_client_project

Revision ID: 10c8f11924df
Revises: 26d6ef4bcd42
Create Date: 2026-03-15 09:46:18.560175

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '10c8f11924df'
down_revision: Union[str, Sequence[str], None] = '26d6ef4bcd42'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
