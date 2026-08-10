import json
import logging
import os
import sqlite3
from datetime import datetime, timezone

logger = logging.getLogger("database")

DB_PATH = os.path.join(os.path.dirname(__file__), "memory.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    with conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                name TEXT,
                language_preference TEXT,
                schemes_checked TEXT,
                eligibility_answers TEXT,
                last_interaction TIMESTAMP,
                created_at TIMESTAMP,
                updated_at TIMESTAMP
            )
        """)
    conn.close()

def get_user(user_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()

    if row:
        data = dict(row)
        try:
            data['schemes_checked'] = json.loads(data['schemes_checked']) if data['schemes_checked'] else []
        except json.JSONDecodeError:
            data['schemes_checked'] = []

        try:
            data['eligibility_answers'] = json.loads(data['eligibility_answers']) if data['eligibility_answers'] else {}
        except json.JSONDecodeError:
            data['eligibility_answers'] = {}

        return data
    return None

def save_user(user_id: str, name: str = None, language_preference: str = None,
              schemes_checked: list = None, eligibility_answers: dict = None):
    conn = get_db()
    cursor = conn.cursor()

    now = datetime.now(timezone.utc)

    # Check if user exists
    cursor.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
    row = cursor.fetchone()

    if row:
        existing = dict(row)

        # Merge arrays/dicts if needed, or simply overwrite based on what is provided
        new_name = name if name is not None else existing['name']
        new_lang = language_preference if language_preference is not None else existing['language_preference']

        # Merge schemes (avoid duplicates)
        existing_schemes = json.loads(existing['schemes_checked']) if existing['schemes_checked'] else []
        if schemes_checked:
            new_schemes = list(set(existing_schemes + schemes_checked))
        else:
            new_schemes = existing_schemes

        # Merge answers
        existing_answers = json.loads(existing['eligibility_answers']) if existing['eligibility_answers'] else {}
        if eligibility_answers:
            existing_answers.update(eligibility_answers)

        cursor.execute("""
            UPDATE users SET
                name = ?,
                language_preference = ?,
                schemes_checked = ?,
                eligibility_answers = ?,
                last_interaction = ?,
                updated_at = ?
            WHERE user_id = ?
        """, (
            new_name,
            new_lang,
            json.dumps(new_schemes),
            json.dumps(existing_answers),
            now,
            now,
            user_id
        ))
    else:
        cursor.execute("""
            INSERT INTO users (
                user_id, name, language_preference, schemes_checked, 
                eligibility_answers, last_interaction, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            name,
            language_preference,
            json.dumps(schemes_checked or []),
            json.dumps(eligibility_answers or {}),
            now,
            now,
            now
        ))

    conn.commit()
    conn.close()
    return True

def forget_user(user_id: str):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM users WHERE user_id = ?", (user_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

# Initialize DB on import
init_db()
