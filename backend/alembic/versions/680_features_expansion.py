"""680 Features Expansion - Tier 1

Revision ID: 680_features_expansion
Revises: d087e8f66239
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '680_features_expansion'
down_revision = 'd087e8f66239'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to clients table
    op.add_column('clients', sa.Column('company', sa.String(), nullable=True))
    op.add_column('clients', sa.Column('address', sa.Text(), nullable=True))
    op.add_column('clients', sa.Column('industry', sa.String(), nullable=True))
    op.add_column('clients', sa.Column('source', sa.String(), nullable=True))
    op.add_column('clients', sa.Column('status', sa.String(), nullable=True))
    op.add_column('clients', sa.Column('rating', sa.Integer(), nullable=True))
    op.add_column('clients', sa.Column('budget_range_min', sa.Float(), nullable=True))
    op.add_column('clients', sa.Column('budget_range_max', sa.Float(), nullable=True))
    op.add_column('clients', sa.Column('timezone', sa.String(), nullable=True))
    op.add_column('clients', sa.Column('language', sa.String(), nullable=True))
    op.add_column('clients', sa.Column('notes', sa.Text(), nullable=True))
    op.add_column('clients', sa.Column('tags', sa.String(), nullable=True))
    op.add_column('clients', sa.Column('avatar_url', sa.String(), nullable=True))
    op.add_column('clients', sa.Column('lifetime_value', sa.Float(), nullable=True))
    op.add_column('clients', sa.Column('total_revenue', sa.Float(), nullable=True))
    op.add_column('clients', sa.Column('project_count', sa.Integer(), nullable=True))
    op.add_column('clients', sa.Column('health_score', sa.Integer(), nullable=True))
    op.add_column('clients', sa.Column('engagement_score', sa.Integer(), nullable=True))
    op.add_column('clients', sa.Column('satisfaction_score', sa.Integer(), nullable=True))
    op.add_column('clients', sa.Column('communication_frequency', sa.Integer(), nullable=True))
    op.add_column('clients', sa.Column('created_at', sa.DateTime(), nullable=True))
    op.add_column('clients', sa.Column('updated_at', sa.DateTime(), nullable=True))
    op.add_column('clients', sa.Column('last_contacted', sa.DateTime(), nullable=True))
    op.add_column('clients', sa.Column('contract_expiry', sa.Date(), nullable=True))
    op.add_column('clients', sa.Column('custom_fields', sa.Text(), nullable=True))
    op.add_column('clients', sa.Column('payment_terms', sa.String(), nullable=True))
    op.add_column('clients', sa.Column('average_project_value', sa.Float(), nullable=True))

    # Add new columns to projects table
    op.add_column('projects', sa.Column('priority', sa.String(), nullable=True))
    op.add_column('projects', sa.Column('category', sa.String(), nullable=True))
    op.add_column('projects', sa.Column('tags', sa.String(), nullable=True))
    op.add_column('projects', sa.Column('is_personal', sa.Boolean(), nullable=True))
    op.add_column('projects', sa.Column('is_growth', sa.Boolean(), nullable=True))
    op.add_column('projects', sa.Column('budget', sa.Float(), nullable=True))
    op.add_column('projects', sa.Column('hourly_rate', sa.Float(), nullable=True))
    op.add_column('projects', sa.Column('currency', sa.String(), nullable=True))
    op.add_column('projects', sa.Column('billing_type', sa.String(), nullable=True))
    op.add_column('projects', sa.Column('actual_end_date', sa.Date(), nullable=True))
    op.add_column('projects', sa.Column('custom_fields', sa.Text(), nullable=True))
    op.add_column('projects', sa.Column('created_at', sa.DateTime(), nullable=True))
    op.add_column('projects', sa.Column('updated_at', sa.DateTime(), nullable=True))

    # Add new columns to calls table
    op.add_column('calls', sa.Column('scheduled_at', sa.DateTime(), nullable=True))
    op.add_column('calls', sa.Column('duration', sa.Integer(), nullable=True))
    op.add_column('calls', sa.Column('call_type', sa.String(), nullable=True))

    # Add new columns to project_phases table
    op.add_column('project_phases', sa.Column('description', sa.Text(), nullable=True))
    op.add_column('project_phases', sa.Column('order', sa.Integer(), nullable=True))
    op.add_column('project_phases', sa.Column('start_date', sa.Date(), nullable=True))
    op.add_column('project_phases', sa.Column('end_date', sa.Date(), nullable=True))

    # Create new tables
    op.create_table('client_contacts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('client_id', sa.Integer(), nullable=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=True),
        sa.Column('phone', sa.String(), nullable=True),
        sa.Column('role', sa.String(), nullable=True),
        sa.Column('is_primary', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('client_contracts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('client_id', sa.Integer(), nullable=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('value', sa.Float(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('document_url', sa.String(), nullable=True),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('invoices',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('client_id', sa.Integer(), nullable=True),
        sa.Column('invoice_number', sa.String(), nullable=False),
        sa.Column('amount', sa.Float(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('issue_date', sa.Date(), nullable=True),
        sa.Column('due_date', sa.Date(), nullable=True),
        sa.Column('paid_date', sa.Date(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('communications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('client_id', sa.Integer(), nullable=True),
        sa.Column('project_id', sa.Integer(), nullable=True),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('direction', sa.String(), nullable=False),
        sa.Column('subject', sa.String(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('duration', sa.Integer(), nullable=True),
        sa.Column('occurred_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['client_id'], ['clients.id'], ),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('tasks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('priority', sa.String(), nullable=True),
        sa.Column('assignee', sa.String(), nullable=True),
        sa.Column('due_date', sa.Date(), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('estimated_hours', sa.Float(), nullable=True),
        sa.Column('actual_hours', sa.Float(), nullable=True),
        sa.Column('progress', sa.Integer(), nullable=True),
        sa.Column('is_completed', sa.Boolean(), nullable=True),
        sa.Column('parent_task_id', sa.Integer(), nullable=True),
        sa.Column('depends_on', sa.String(), nullable=True),
        sa.Column('tags', sa.String(), nullable=True),
        sa.Column('order', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
        sa.ForeignKeyConstraint(['parent_task_id'], ['tasks.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('milestones',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('due_date', sa.Date(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('is_completed', sa.Boolean(), nullable=True),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table('bugs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('severity', sa.String(), nullable=True),
        sa.Column('priority', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('steps_to_reproduce', sa.Text(), nullable=True),
        sa.Column('expected_behavior', sa.Text(), nullable=True),
        sa.Column('actual_behavior', sa.Text(), nullable=True),
        sa.Column('environment', sa.String(), nullable=True),
        sa.Column('browser', sa.String(), nullable=True),
        sa.Column('operating_system', sa.String(), nullable=True),
        sa.Column('device', sa.String(), nullable=True),
        sa.Column('assignee', sa.String(), nullable=True),
        sa.Column('reporter', sa.String(), nullable=True),
        sa.Column('attachment_url', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('resolved_at', sa.DateTime(), nullable=True),
        sa.Column('closed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    # Drop new tables
    op.drop_table('bugs')
    op.drop_table('milestones')
    op.drop_table('tasks')
    op.drop_table('communications')
    op.drop_table('invoices')
    op.drop_table('client_contracts')
    op.drop_table('client_contacts')

    # Remove columns from project_phases
    op.drop_column('project_phases', 'end_date')
    op.drop_column('project_phases', 'start_date')
    op.drop_column('project_phases', 'order')
    op.drop_column('project_phases', 'description')

    # Remove columns from calls
    op.drop_column('calls', 'call_type')
    op.drop_column('calls', 'duration')
    op.drop_column('calls', 'scheduled_at')

    # Remove columns from projects
    op.drop_column('projects', 'updated_at')
    op.drop_column('projects', 'created_at')
    op.drop_column('projects', 'custom_fields')
    op.drop_column('projects', 'actual_end_date')
    op.drop_column('projects', 'billing_type')
    op.drop_column('projects', 'currency')
    op.drop_column('projects', 'hourly_rate')
    op.drop_column('projects', 'budget')
    op.drop_column('projects', 'is_growth')
    op.drop_column('projects', 'is_personal')
    op.drop_column('projects', 'tags')
    op.drop_column('projects', 'category')
    op.drop_column('projects', 'priority')

    # Remove columns from clients
    op.drop_column('clients', 'average_project_value')
    op.drop_column('clients', 'payment_terms')
    op.drop_column('clients', 'custom_fields')
    op.drop_column('clients', 'contract_expiry')
    op.drop_column('clients', 'last_contacted')
    op.drop_column('clients', 'updated_at')
    op.drop_column('clients', 'created_at')
    op.drop_column('clients', 'communication_frequency')
    op.drop_column('clients', 'satisfaction_score')
    op.drop_column('clients', 'engagement_score')
    op.drop_column('clients', 'health_score')
    op.drop_column('clients', 'project_count')
    op.drop_column('clients', 'total_revenue')
    op.drop_column('clients', 'lifetime_value')
    op.drop_column('clients', 'avatar_url')
    op.drop_column('clients', 'tags')
    op.drop_column('clients', 'notes')
    op.drop_column('clients', 'language')
    op.drop_column('clients', 'timezone')
    op.drop_column('clients', 'budget_range_max')
    op.drop_column('clients', 'budget_range_min')
    op.drop_column('clients', 'rating')
    op.drop_column('clients', 'status')
    op.drop_column('clients', 'source')
    op.drop_column('clients', 'industry')
    op.drop_column('clients', 'address')
    op.drop_column('clients', 'company')

