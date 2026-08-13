import json
import sys

import database


def get_overview():
    overview = database.get_call_analytics_overview()
    print(json.dumps(overview))

def get_calls():
    calls = database.get_recent_calls()
    # Convert datetime strings to something JSON serializable if needed
    # sqlite Row usually returns strings for timestamp if we use python datetime
    # but database.py returns dicts directly.
    # Let's ensure datetime is string
    for call in calls:
        if call.get('started_at'):
            call['started_at'] = str(call['started_at'])
        if call.get('ended_at'):
            call['ended_at'] = str(call['ended_at'])
    print(json.dumps(calls))

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "overview":
        get_overview()
    elif len(sys.argv) > 1 and sys.argv[1] == "calls":
        get_calls()
    else:
        print(json.dumps({"error": "specify 'overview' or 'calls'"}))
