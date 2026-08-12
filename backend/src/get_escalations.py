import json
import sys

import database


def main():
    if len(sys.argv) > 1 and sys.argv[1] == "update":
        ref_id = sys.argv[2]
        status = sys.argv[3]
        database.update_escalation_status(ref_id, status)
        print(json.dumps({"success": True}))
    else:
        escalations = database.get_escalations()
        print(json.dumps(escalations))

if __name__ == "__main__":
    main()
