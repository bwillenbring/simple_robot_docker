# Barebones Robot Docker Container
Runnable tests with example test files for...
- Robot keyword only tests (using `SeleniumLibrary`)
- Robot keyword + Python scripts (using `robot.libraries.BuiltIn` and `robot.api.deco`)
- Python only selenium tests - callable from Robot, or as standalone files


----

## How to Use this repo
In addition to `git`, all you need is `Docker 18.06` or higher. [Install it here](https://www.google.com).
#### 1. Clone the repo locally
```
git clone https://github.com/bwillenbring/simple_robot_docker.git
```

#### 2. Modify `docker-compose.yml` in these ways: <br/>

| Env. Variable | Notes |
| ------------- | ----- |
| `BROWSER` | One of the following: `chrome` or `firefox` (in lowercase)|

Note: no other values need to be changed in order to run the sample test spec.

#### 3. Build the container
`cd` into the directory that contains `docker-compose.yml`, then do this...
```
docker-compose build
```

### 4. Bring the container up and see a single Robot test run...
From the directory that contains `docker-compose.yml`, then do this...
```
docker-compose up robot
```
Doing the above will result in the execution of `simple-keywords.robot` from within the container. You'll see this kind of output...
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
