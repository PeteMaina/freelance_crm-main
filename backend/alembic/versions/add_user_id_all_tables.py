"""Add user_id to all tables and create notifications

Revision ID: add_user_id_all_tables
Revises: 10c8f11924df
Create Date: 2026-03-16 00:00:00.000000

This migration adds the missing user_id foreign key columns to all tables
that reference the users table. The two previous migrations (26d6ef4bcd42
and 10c8f11924df) were empty stubs — this one actually does the work.

All existing rows are assigned user_id=1 as a safe default, matching the
hardcoded fallback that was in place before auth was enforced.
"""
from alembic import op
import sqlalchemy as sa

revision = 'add_user_id_all_tables'
down_revision = '10c8f11924df'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ------------------------------------------------------------------ #
    # 1. clients — add user_id                                            #
    # ------------------------------------------------------------------ #
    op.add_column('clients',
        sa.Column('user_id', sa.Integer(),
                  sa.ForeignKey('users.id'),
                  nullable=True))          # nullable first so existing rows are accepted
    op.execute("UPDATE clients SET user_id = 1 WHERE user_id IS NULL")
    op.alter_column('clients', 'user_id', nullable=False)

    # ------------------------------------------------------------------ #
    # 2. projects — add user_id                                           #
    # ------------------------------------------------------------------ #
    op.add_column('projects',
        sa.Column('user_id', sa.Integer(),
                  sa.ForeignKey('users.id'),
                  nullable=True))
    op.execute("UPDATE projects SET user_id = 1 WHERE user_id IS NULL")
    op.alter_column('projects', 'user_id', nullable=False)

    # ------------------------------------------------------------------ #
    # 3. tasks — add user_id                                              #
    # ------------------------------------------------------------------ #
    op.add_column('tasks',
        sa.Column('user_id', sa.Integer(),
                  sa.ForeignKey('users.id'),
                  nullable=True))
    op.execute("UPDATE tasks SET user_id = 1 WHERE user_id IS NULL")
    op.alter_column('tasks', 'user_id', nullable=False)

    # ------------------------------------------------------------------ #
    # 4. milestones — add user_id                                         #
    # ------------------------------------------------------------------ #
    op.add_column('milestones',
        sa.Column('user_id', sa.Integer(),
                  sa.ForeignKey('users.id'),
                  nullable=True))
    op.execute("UPDATE milestones SET user_id = 1 WHERE user_id IS NULL")
    op.alter_column('milestones', 'user_id', nullable=False)

    # ------------------------------------------------------------------ #
    # 5. bugs — add user_id                                               #
    # ------------------------------------------------------------------ #
    op.add_column('bugs',
        sa.Column('user_id', sa.Integer(),
                  sa.ForeignKey('users.id'),
                  nullable=True))
    op.execute("UPDATE bugs SET user_id = 1 WHERE user_id IS NULL")
    op.alter_column('bugs', 'user_id', nullable=False)

    # ------------------------------------------------------------------ #
    # 6. calls — add user_id + created_at (if not already present)       #
    # ------------------------------------------------------------------ #
    op.add_column('calls',
        sa.Column('user_id', sa.Integer(),
                  sa.ForeignKey('users.id'),
                  nullable=True))
    op.execute("UPDATE calls SET user_id = 1 WHERE user_id IS NULL")
    op.alter_column('calls', 'user_id', nullable=False)

    # created_at was added in a previous migration but guard with try/except
    # in case it's missing on some environments
    try:
        op.add_column('calls',
            sa.Column('created_at', sa.DateTime(), nullable=True))
    except Exception:
        pass  # column already exists — safe to ignore

    # ------------------------------------------------------------------ #
    # 7. sprints — add user_id                                            #
    # ------------------------------------------------------------------ #
    op.add_column('sprints',
        sa.Column('user_id', sa.Integer(),
                  sa.ForeignKey('users.id'),
                  nullable=True))
    op.execute("UPDATE sprints SET user_id = 1 WHERE user_id IS NULL")
    op.alter_column('sprints', 'user_id', nullable=False)

    # ------------------------------------------------------------------ #
    # 8. personal_todos — add user_id                                     #
    # ------------------------------------------------------------------ #
    op.add_column('personal_todos',
        sa.Column('user_id', sa.Integer(),
                  sa.ForeignKey('users.id'),
                  nullable=True))
    op.execute("UPDATE personal_todos SET user_id = 1 WHERE user_id IS NULL")
    op.alter_column('personal_todos', 'user_id', nullable=False)

    # ------------------------------------------------------------------ #
    # 9. notifications — create table (new, never existed before)        #
    # ------------------------------------------------------------------ #
    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(),
                  sa.ForeignKey('users.id'), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('related_id', sa.Integer(), nullable=False),
        sa.Column('alert_type', sa.String(), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=True, default=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('project_id', sa.Integer(),
                  sa.ForeignKey('projects.id'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('notifications')

    for table in ['personal_todos', 'sprints', 'calls', 'bugs',
                  'milestones', 'tasks', 'projects', 'clients']:
        op.drop_column(table, 'user_id')
