from shotgun_api3 import Shotgun
import datetime
import os
import sys

# From env. variables
SERVER_PATH = os.environ.get("BASE_URL", "")
LOGIN = os.environ.get("USERNAME", "")
PASSWORD = os.environ.get("PASSWORD", "")
#
# Instantiate a connection object with Shotgun Server
sg = Shotgun(SERVER_PATH, login=LOGIN, password=PASSWORD)

if __name__ == "__main__":
    # Create a unique project name
    proj_name = datetime.datetime.now().strftime('%m-%d-%Y %H:%M:%S %f')
    proj_name = "Robot Project %s" % proj_name

    # Try to create a test project
    try:
        p = sg.create("Project", {"name": proj_name}, return_fields=["id"])
        id = p["id"]
        print id

    except Exception as E:
        print os.environ.get("TEST_PROJECT_ID")
