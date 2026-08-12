import json
import logging
import os
import random
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
                updated_at TIMESTAMP,
                outbound_opt_out BOOLEAN DEFAULT 0
            )
        """)

        try:
            conn.execute("ALTER TABLE users ADD COLUMN outbound_opt_out BOOLEAN DEFAULT 0")
        except sqlite3.OperationalError:
            pass # Column already exists

        conn.execute("""
            CREATE TABLE IF NOT EXISTS outbound_calls (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                phone_number TEXT,
                reason TEXT,
                scheme_id TEXT,
                status TEXT,
                created_at TIMESTAMP,
                answered_at TIMESTAMP,
                ended_at TIMESTAMP,
                retry_count INTEGER DEFAULT 0
            )
        """)

        conn.execute("""
            CREATE TABLE IF NOT EXISTS escalations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                reference_id TEXT UNIQUE,
                user_id TEXT,
                reason TEXT,
                summary TEXT,
                what_happened TEXT,
                what_agent_checked TEXT,
                urgency TEXT,
                language TEXT,
                preferred_follow_up TEXT,
                status TEXT DEFAULT 'OPEN',
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

def set_opt_out(user_id: str, opt_out: bool = True):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET outbound_opt_out = ? WHERE user_id = ?", (1 if opt_out else 0, user_id))
    conn.commit()
    conn.close()

def create_outbound_call(call_id: str, user_id: str, phone_number: str, reason: str, scheme_id: str = None):
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc)
    cursor.execute("""
        INSERT INTO outbound_calls (id, user_id, phone_number, reason, scheme_id, status, created_at, retry_count)
        VALUES (?, ?, ?, ?, ?, 'initiated', ?, 0)
    """, (call_id, user_id, phone_number, reason, scheme_id, now))
    conn.commit()
    conn.close()

def update_outbound_call_status(call_id: str, status: str):
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc)

    updates = ["status = ?"]
    params = [status]

    if status in ['answered', 'connected']:
        updates.append("answered_at = ?")
        params.append(now)
    elif status in ['completed', 'no_answer', 'busy', 'voicemail', 'failed', 'opted_out']:
        updates.append("ended_at = ?")
        params.append(now)

    params.append(call_id)

    cursor.execute(f"UPDATE outbound_calls SET {', '.join(updates)} WHERE id = ?", params)
    conn.commit()
    conn.close()

def get_outbound_calls():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM outbound_calls ORDER BY created_at DESC LIMIT 50")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def create_escalation(user_id: str, reason: str, summary: str, what_happened: str,
                     what_agent_checked: str, urgency: str, language: str,
                     preferred_follow_up: str) -> str:
    conn = get_db()
    cursor = conn.cursor()

    # Check for existing open escalation for same user and reason
    cursor.execute("""
        SELECT reference_id FROM escalations 
        WHERE user_id = ? AND reason = ? AND status = 'OPEN'
    """, (user_id, reason))
    existing = cursor.fetchone()
    if existing:
        conn.close()
        return existing['reference_id']

    now = datetime.now(timezone.utc)
    reference_id = f"ESC-{now.year}-{random.randint(1000, 9999)}"

    # Ensure uniqueness just in case
    while True:
        cursor.execute("SELECT 1 FROM escalations WHERE reference_id = ?", (reference_id,))
        if not cursor.fetchone():
            break
        reference_id = f"ESC-{now.year}-{random.randint(1000, 9999)}"

    cursor.execute("""
        INSERT INTO escalations (
            reference_id, user_id, reason, summary, what_happened, 
            what_agent_checked, urgency, language, preferred_follow_up, 
            status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?, ?)
    """, (
        reference_id, user_id, reason, summary, what_happened,
        what_agent_checked, urgency, language, preferred_follow_up,
        now, now
    ))
    conn.commit()
    conn.close()
    return reference_id

def get_escalations():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM escalations ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def update_escalation_status(reference_id: str, status: str):
    conn = get_db()
    cursor = conn.cursor()
    now = datetime.now(timezone.utc)
    cursor.execute("""
        UPDATE escalations 
        SET status = ?, updated_at = ? 
        WHERE reference_id = ?
    """, (status, now, reference_id))
    conn.commit()
    conn.close()

# Initialize DB on import
init_db()
