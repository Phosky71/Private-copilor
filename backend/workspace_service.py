import sqlite3

DB = "storage/workspaces.sqlite"


def create_workspace(name):
    conn = sqlite3.connect(DB)
    c = conn.cursor()

    c.execute("INSERT OR IGNORE INTO workspaces VALUES (?)", (name,))
    conn.commit()
    conn.close()


def add_path(workspace, path):
    conn = sqlite3.connect(DB)
    c = conn.cursor()

    c.execute(
        "INSERT INTO paths (workspace, path) VALUES (?, ?)",
        (workspace, path)
    )

    conn.commit()
    conn.close()


def list_workspaces():
    conn = sqlite3.connect(DB)
    c = conn.cursor()

    c.execute("SELECT name FROM workspaces")
    return [x[0] for x in c.fetchall()]


def get_paths(workspace):
    conn = sqlite3.connect(DB)
    c = conn.cursor()

    c.execute("SELECT path FROM paths WHERE workspace=?", (workspace,))
    return [x[0] for x in c.fetchall()]