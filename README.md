# Barebones Robot Docker Container


[repoImage]: fixtures/pipeline.jpg "Barebones Robot Docker Container"

![repoImage]

**Includes the following:**
- [Sample Robot specs in the `test` directory](test/)
- [Sample Robot Listener in the `listeners` directory](listeners/CustomListener.py) - with empty method calls that hook into start and end events
- [Sample test launch script in `testLauncher`](testLauncher/testLauncher.py)
- [`requirements.txt`](requirements.txt) - if you'd like to install the python libs to run these tests on your host machine

----

# Installation & How to Use this Repo
In addition to `git`, all you need is `Docker 18.06` or higher. [Install Docker here](https://docs.docker.com/install/).
## 1. Clone the repo locally
```
git clone https://github.com/bwillenbring/simple_robot_docker.git
```

----

## 2. Optionally change the browser in `docker-compose.yml`
Skip this step if you just want to build and up the container, and see a simple test run.

| Env. Variable | Notes |
| ------------- | ----- |
| `BROWSER` | <ul><li>`chrome` (default)</li><li>`firefox`</li></ul> |

----

### 2.1 You can skip to step 3
No env vars need to be changed in order to run the following test specs:
- `simple-keywords.robot` (automatically run when you up the container)
- `simple-python-libs.robot`
- `simple-variables.robot`

----

### 2.2 Read this if you want to run the file upload test
To run `simple-file-upload-test.robot`, you'll also need the following:
- Access to a Shotgun Site ([spin up a free trial here](https://www.shotgunsoftware.com/trial/))
- Correctly set env. variables in `docker-compose.yml`
  - `BASE_URL` - an URL to a valid Shotgun Site
  - `USERNAME` - a valid admin login for your Shotgun Site
  - `PASSWORD` - a valid password for your Shotgun login
  - `TEST_PROJECT_ID` - a valid Shotgun project id


- Correctly set `ROBOT_SPECS` in `docker-compose.yml`. Here's how...
```bash
# Change this...
ROBOT_SPECS: /opt/robotframework/test/simple-keywords.robot
# To this...
ROBOT_SPECS: /opt/robotframework/test/simple-file-upload-test.robot
```

----

## 3. Build the container
`cd` into the directory that contains `docker-compose.yml`, then do this...
```
docker-compose build
```

----

## 4. Bring the container up
`cd` into the directory that contains `docker-compose.yml`, then do this...
```
docker-compose up robot
```
Doing the above ^^ will result in the execution of a single Robot test (configured in `docker-compose.yml`) that runs headlessly inside the Docker container - [simple-keywords.robot](test/simple-keywords.robot).

You'll see this kind of output...
```
Starting robotv3_robot_1 ... done
Attaching to robotv3_robot_1
robot_1  | ==============================================================================
robot_1  | Simple-Keywords                                                               
robot_1  | ==============================================================================
robot_1  | Robot test suite is starting...
robot_1  | Do a google search and click on the top search result                 | PASS |
robot_1  | ------------------------------------------------------------------------------
robot_1  | Robot test suite has ended...
robot_1  | Simple-Keywords                                                       | PASS |
robot_1  | 1 critical test, 1 passed, 0 failed
robot_1  | 1 test total, 1 passed, 0 failed
robot_1  | ==============================================================================
robot_1  | Output:  /opt/robotframework/reports/output.xml
robot_1  | Log:     /opt/robotframework/reports/log.html
robot_1  | Report:  /opt/robotframework/reports/report.html
```
The last line should show an `exit code of 0`:
```
robotv3_robot_1 exited with code 0
```
If not, the test failed :grimacing:

----

# Running your own Robot tests on your host machine (no Docker)
**Assumptions**
- You've cloned the repo
- You've already done `pip install requirements.txt`

**How to do it (1-2-3 style)**

1. Create a new valid Robot test file and save it into the `test` directory
1. Run this simple command: <br/>
```bash
robot test/your_test_file.robot
```
Optionally specify an outputdir (for reports & screenshots)...
```bash
robot --outputdir reports test/your_test_file.robot
```
Optionally pass in a listener...
```bash
robot --outputdir reports --listener listeners/CustomListener.py test/your_test_file.robot
```
