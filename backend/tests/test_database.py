import os

# Ensure we import the database module properly
import sys
import tempfile

import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))
import database


@pytest.fixture(autouse=True)
def setup_db():
    fd, temp_path = tempfile.mkstemp()
    os.close(fd)
    database.DB_PATH = temp_path
    database.init_db()
    yield
    os.unlink(temp_path)

def test_save_and_get_user():
    user_id = "test_user_123"

    # Get non-existent
    assert database.get_user(user_id) is None

    # Save new
    database.save_user(
        user_id,
        name="Rahul",
        language_preference="Hindi",
        schemes_checked=["PM-KISAN"],
        eligibility_answers={"age": 30}
    )

    # Get existing
    data = database.get_user(user_id)
    assert data["name"] == "Rahul"
    assert data["language_preference"] == "Hindi"
    assert "PM-KISAN" in data["schemes_checked"]
    assert data["eligibility_answers"]["age"] == 30

def test_update_user():
    user_id = "test_user_456"

    # Save initial
    database.save_user(user_id, name="Rahul", schemes_checked=["A"])

    # Update
    database.save_user(user_id, language_preference="English", schemes_checked=["B"])

    data = database.get_user(user_id)
    assert data["name"] == "Rahul" # Unchanged
    assert data["language_preference"] == "English"
    assert set(data["schemes_checked"]) == {"A", "B"}

def test_forget_user():
    user_id = "test_user_789"
    database.save_user(user_id, name="Rahul")
    assert database.get_user(user_id) is not None

    deleted = database.forget_user(user_id)
    assert deleted is True
    assert database.get_user(user_id) is None
