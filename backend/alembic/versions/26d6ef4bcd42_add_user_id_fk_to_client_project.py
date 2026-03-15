"""add_user_id_fk_to_client_project

Revision ID: 26d6ef4bcd42
Revises: tier2_sprints_todos
Create Date: 2026-03-15 09:45:52.263781

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '26d6ef4bcd42'
down_revision: Union[str, Sequence[str], None] = 'tier2_sprints_todos'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
