FROM ppodgorsek/robot-framework@sha256:a83dfadeff9621e82552be002dc67a184d7f73b86ef76b06d306135f40a19ed0 as ROBOT

# FROM ROBOT as GIT
# Install git (this doesn't work on Alpine Linux)
# RUN yum install -y git

# Set workding dir to what's in the existing image
WORKDIR /opt/robotframework

# Make the directories that you will volume mount
RUN mkdir testLauncher libraries listeners fixtures

# Add requirements.txt so it's there
# ADD ./requirements.txt /opt/robotframework/

# Install requirements
# RUN pip install --trusted-host pypi.python.org -r requirements.txt
