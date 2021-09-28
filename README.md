# Cypress & Robot Docker Container

![](https://github.com/bwillenbring/simple_robot_docker/workflows/Run%20Tests/badge.svg)

[repoImage]: robot/fixtures/pipeline.jpg "Barebones Robot Docker Container"

![repoImage]

## This repo uses Github Workflow Actions
  - [Workflow definition](.github/workflows/pythonapp.yml)

## Output of the workflow:
  1. [Cypress Mochawesome Report](https://github-bwillenbring.s3.us-east-2.amazonaws.com/cypress/mochawesome.html) 
  2. [Robot Report](https://github-bwillenbring.s3.us-east-2.amazonaws.com/robot/report.html)

## Cypress and Robot are Docker images
About the images:
  - Cypress
      - Uses `Cypress v6.5` 
      - [Runs a few simple cypress specs](cypress/integration/)
  - Robot
      - Uses `python 2.7` and `robot 3.1.2`
      - [Runs a few simple Robot specs](robot/test/)
      - [Includes a sample Robot Listener in the `listeners` directory](robot/listeners/CustomListener.py) - with empty method calls that hook into start and end events
      - [Includes a sample test launch script in the `testLauncher` directory](robot/testLauncher/testLauncher.py)
      - [`requirements.txt`](robot/requirements.txt) - if you'd like to install the python libs to run these tests on your host machine


----

# How to install and use this repo locally
## Assumes the following
- You have git, and can clone a repo
- You have `Docker 18.06` or higher -- [You can install Docker here](https://docs.docker.com/install/).


## 1. Clone this repo locally
```
git clone https://github.com/bwillenbring/simple_robot_docker.git
```
Then `cd` into the directory that contains `docker-compose.yml`.

----

## 2. Bring up the `cypress` container
```
# If it's not yet built...
docker-compose up --build cypress

# If it's already build...
docker-coompose up cypress
```
You should then see this kind of output...
```
WARNING: The BASE_URL variable is not set. Defaulting to a blank string.
WARNING: The USERNAME variable is not set. Defaulting to a blank string.
WARNING: The PASSWORD variable is not set. Defaulting to a blank string.
WARNING: The TEST_PROJECT_ID variable is not set. Defaulting to a blank string.
Starting simple_robot_docker_cypress_1 ... done
Attaching to simple_robot_docker_cypress_1
cypress_1  | npm WARN prepare removing existing node_modules/ before installation
```

### 2.1 What ☝🏽 that does
  - Executes the Cypress specs inside the container (eg: [simple-spec.js](cypress/integration/simple-spec.js))
  - Video records the test run into the mounted volume in `/cypress/videos/`

## 3. Bring up the `robot` container
```
# If it's not yet build...
docker-compose up --build robot

# If it's already build...
docker-compose up robot
```

### 3.1 What ☝🏽 that does
  - Executes the Robot tests (configured in `docker-compose.yml`) headlessly inside the Docker container - (eg: [simple-keywords.robot](robot/test/simple-keywords.robot))
  - You should then see this kind of output...

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
robotv3_robot_1 exited with code 0
```
The last line should show an `exit code of 0`. If not, the test failed :grimacing:

----

## 3. Create and Run your own Robot tests
**To see a browser running your own tests, do this:**
1. If you haven't already done so, cd to the top level directory, and run... <br/><pre><code>pip install robot/requirements.txt</code></pre>
1. Create a new valid Robot test file - [here's a very simple test snippet to get you started](robot/test/simple-keywords.robot)
1. Save your robot file into the `robot/test` directory
1. Open a shell, cd to the `robot` directory, then run your file like so...: <br/><pre><code>cd robot
robot test/your_test_file.robot</code></pre> <br/>**Optionally** specify an `outputdir` (for reports & screenshots)... <pre><code>robot --outputdir reports test/your_test_file.robot</code></pre><br/>**Optionally** pass in a `listener`...<br/><pre><code>robot --outputdir reports --listener listeners/CustomListener.py test/your_test_file.robot</code></pre>
