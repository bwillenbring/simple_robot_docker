import json
import os
import sys

# There are 4 critical cypress configs that MUST be overwritten by env. variables
configs_to_overwrite = {
    "baseUrl": os.environ.get("BASE_URL"),
    "admin_login": os.environ.get("USERNAME"),
    "admin_pwd": os.environ.get("PASSWORD"),
    "TEST_PROJECT": {
        "id": int(os.environ.get("TEST_PROJECT_ID"))
    }
}

# open your existing cypress config
# this is NOT done from within the container
with open('/cypress/cypress.json') as json_file:
    data = json.load(json_file)
    for c in configs_to_overwrite:
        data[c] = configs_to_overwrite[c]
    json_file.close()

# Now write your new json file...
with open('/cypress/cypress.json', 'w') as outfile:
    json.dump(data, outfile, sort_keys=True, indent=4)
    outfile.close()

# do not call this: run.js now executes the cypress call
# Create your cypress command (which runs all specs in the configured dir)
# cmd = "cypress run"
# os.system(cmd)
