import datetime
import json
import os
from typing import Optional

# Path to the compiled dataset
DATASET_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "compiled_schemes.json")

# Load schemes into memory once
try:
    with open(DATASET_PATH, encoding="utf-8") as f:
        SCHEMES = json.load(f)
except Exception as e:
    print(f"Warning: Could not load compiled schemes: {e}")
    SCHEMES = []

def search_schemes(state: Optional[str] = None, occupation: Optional[str] = None, age: Optional[int] = None, gender: Optional[str] = None):
    results = []

    for scheme in SCHEMES:
        # Check State Match
        scheme_state = scheme.get("state", "All").lower()
        if state and scheme_state != "all" and state.lower() not in scheme_state:
            continue

        # Basic keyword scoring for relevance
        score = 0
        full_text_lower = scheme.get("full_text", "").lower()

        if occupation:
            # check if occupation is in the text
            if occupation.lower() in full_text_lower:
                score += 2

        if gender:
            if gender.lower() == "female" and any(w in full_text_lower for w in ["girl", "women", "female"]):
                score += 2
            elif gender.lower() == "male" and any(w in full_text_lower for w in ["boy", "men", "male"]):
                score += 1

        if age is not None:
            # very fuzzy age check
            if str(age) in full_text_lower or "years" in full_text_lower:
                score += 1

        # If user provided specifics and we matched them, include it.
        # If user provided nothing, just return top results.
        # But this is a simple demo, so we'll just include if there's any score or if no specific filters were applied that failed.
        if (occupation or gender or age) and score == 0 and state is None:
            # If they asked for specific occupation but score is 0, skip
            # Unless they specified state and state matched exactly
            continue

        formatted = {
            "name": scheme.get("scheme_name", "Unknown Scheme"),
            "why_relevant": scheme.get("description", "")[:250] + "...",
            "benefits": scheme.get("benefits", "Please refer to official text."),
            "documents": ["Aadhaar Card", "Income Certificate", "Bank Passbook (if financial benefit)"],
            "next_step": "Verify precise eligibility at the official portal or nearest CSC.",
            "source": scheme.get("source", "Government Dataset"),
            "last_updated": "2026-08-13",
            "verification_status": "Information retrieved successfully."
        }

        results.append((score, formatted))

    # Sort by score and return top 5 to give enough options without overloading UI
    results.sort(key=lambda x: x[0], reverse=True)
    top_results = [r[1] for r in results[:5]]

    return {
        "success": True,
        "schemes": top_results,
        "checked_at": datetime.datetime.now().isoformat()
    }
