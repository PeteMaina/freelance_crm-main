import sqlite3
import datetime

def fix_database():
    conn = sqlite3.connect('crm.db')
    cursor = conn.cursor()
    
    # helper to check if column exists
    def column_exists(table, column):
        cursor.execute(f"PRAGMA table_info({table})")
        columns = [row[1] for row in cursor.fetchall()]
        return column in columns

    # 1. Fix 'calls' table: add 'created_at' and 'user_id'
    if not column_exists('calls', 'created_at'):
        print("Adding 'created_at' to 'calls'...")
        cursor.execute("ALTER TABLE calls ADD COLUMN created_at DATETIME")

    
    if not column_exists('calls', 'user_id'):
        print("Adding 'user_id' to 'calls'...")
        cursor.execute("ALTER TABLE calls ADD COLUMN user_id INTEGER DEFAULT 1")

    if not column_exists('bugs', 'user_id'):
        print("Adding 'user_id' to 'bugs'...")
        cursor.execute("ALTER TABLE bugs ADD COLUMN user_id INTEGER DEFAULT 1")

    # 2. Fix 'tasks' table: add 'user_id'
    if not column_exists('tasks', 'user_id'):
        print("Adding 'user_id' to 'tasks'...")
        cursor.execute("ALTER TABLE tasks ADD COLUMN user_id INTEGER DEFAULT 1")

    # 3. Fix 'milestones' table: add 'user_id'
    if not column_exists('milestones', 'user_id'):
        print("Adding 'user_id' to 'milestones'...")
        cursor.execute("ALTER TABLE milestones ADD COLUMN user_id INTEGER DEFAULT 1")

    # 4. Fix 'projects' table: ensure 'user_id' exists
    if not column_exists('projects', 'user_id'):
        print("Adding 'user_id' to 'projects'...")
        cursor.execute("ALTER TABLE projects ADD COLUMN user_id INTEGER DEFAULT 1")

    # 5. Fix 'clients' table: ensure 'user_id' exists
    if not column_exists('clients', 'user_id'):
        print("Adding 'user_id' to 'clients'...")
        cursor.execute("ALTER TABLE clients ADD COLUMN user_id INTEGER DEFAULT 1")

    # 6. Fix 'sprints' table: add 'user_id'
    if not column_exists('sprints', 'user_id'):
        print("Adding 'user_id' to 'sprints'...")
        cursor.execute("ALTER TABLE sprints ADD COLUMN user_id INTEGER DEFAULT 1")

    # 7. Fix 'clients' table: add missing fields
    client_columns = {
        'magic_link_token': 'VARCHAR',
        'magic_link_password': 'VARCHAR',
        'magic_link_expires_at': 'DATETIME',
        'lifetime_value': 'FLOAT DEFAULT 0',
        'total_revenue': 'FLOAT DEFAULT 0',
        'project_count': 'INTEGER DEFAULT 0',
        'health_score': 'INTEGER DEFAULT 100',
        'engagement_score': 'INTEGER DEFAULT 0',
        'satisfaction_score': 'INTEGER DEFAULT 0',
        'communication_frequency': 'INTEGER DEFAULT 0',
        'custom_fields': 'TEXT',
        'payment_terms': 'VARCHAR DEFAULT "net30"',
        'average_project_value': 'FLOAT DEFAULT 0',
    }

    for col, ctype in client_columns.items():
        if not column_exists('clients', col):
            print(f"Adding '{col}' to 'clients'...")
            cursor.execute(f"ALTER TABLE clients ADD COLUMN {col} {ctype}")

    conn.commit()
    conn.close()
    print("Database fix complete.")

if __name__ == "__main__":
    fix_database()
