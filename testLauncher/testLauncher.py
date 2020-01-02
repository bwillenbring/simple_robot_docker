import os
# Construct your robot command
cmd = 'xvfb-run robot --reporttitle "Robot Test Suite" '

# Listener
if os.environ.get("ROBOT_LISTENER"):
    cmd += "--listener %s " % os.environ["ROBOT_LISTENER"]

# Output dir
if os.environ.get("ROBOT_OUTPUTDIR"):
    cmd += "--outputdir %s " % os.environ["ROBOT_OUTPUTDIR"]

# Targeted Robot specs
if os.environ.get("ROBOT_SPECS"):
    cmd += os.environ["ROBOT_SPECS"]
else:
    cmd += "/opt/robotframework/test/"

os.system(cmd)
