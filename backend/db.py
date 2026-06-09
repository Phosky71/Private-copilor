import sqlite3

DB = "storage/workspaces.sqlite"

def init_db():
    conn = sqlite3.connect(DB)
    c = conn.cursor()

    c.execute("""
    CREATE TABLE IF NOT EXISTS workspaces (
        name TEXT PRIMARY KEY
    )
    """)

    c.execute("""
    CREATE TABLE IF NOT EXISTS paths (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workspace TEXT,
        path TEXT
    )
    """)

    conn.commit()
    conn.close()