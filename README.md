# Barebones Robot Docker Container


[repoImage]: fixtures/pipeline.jpg "Barebones Robot Docker Container"

![repoImage]

**Includes the following:**
- [Sample Robot specs in the `test` directory](test/)
- [Sample Robot Listener in the `listeners` directory](listeners/CustomListener.py) - with empty method calls that hook into start and end events
- [Sample test launch script in `testLauncher`](testLauncher/testLauncher.py)
- [`requirements.txt`](requirements.txt) - if you'd like to install the python libs to run these tests on your host machine

**Assumes the following:**
- You have git, and can clone a repo
- You have `Docker 18.06` or higher [Install Docker here](https://docs.docker.com/install/).

----

# Installation & How to Use this Repo
## 1. Clone this repo locally
```
git clone https://github.com/bwillenbring/simple_robot_docker.git
```

----

## 2. Build and up the container
`cd` into the directory that contains `docker-compose.yml`, then do this...
```
docker-compose up --build
```

Doing the above ^^ will result in the execution of a single Robot test (configured in `docker-compose.yml`) that runs headlessly inside the Docker container - [simple-keywords.robot](test/simple-keywords.robot).

### You'll see this kind of output...
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

## 3. Create and Run your own Robot tests
**If you'd like to see a browser running your tests**
1. If you haven't already done so, cd to the top level directory, and run...<br/>
```bash
pip install requirements.txt
```
1. Create a new valid Robot test file - [here's a very simple test snippet to get you started](test/simple-keywords.robot)
1. Save your robot file into the `test` directory
1. Open a shell, cd to the directory above `test`, and run this command: <br/>
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
