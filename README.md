# Barebones Robot Docker Container


[repoImage]: fixtures/pipeline.jpg "Barebones Robot Docker Container"

![repoImage]

**Includes the following:**
- [Sample Robot specs in the `test` directory](test/)
- [Sample Robot Listener in the `listeners` directory](listeners/CustomListener.py) - with empty method calls that hook into start and end events
- [Sample test launch script in `testLauncher`](testLauncher/testLauncher.py)
- [`requirements.txt`](requirements.txt) - if you'd like to install the python libs to run these tests on your host machine

----

## How to Use this repo
In addition to `git`, all you need is `Docker 18.06` or higher. [Install Docker here](https://docs.docker.com/install/).
#### 1. Clone the repo locally
```
git clone https://github.com/bwillenbring/simple_robot_docker.git
```

#### 2. Optionally change the browser in `docker-compose.yml` <br/>

| Env. Variable | Notes |
| ------------- | ----- |
| `BROWSER` | <ul><li>`chrome` (default)</li><li>`firefox`</li></ul> |

**Important Notes:**
- No other env vars besides `BROWSER` need to be changed in order to run the sample test spec - `simple-keywords.robot`


- To run `simple-file-upload-test.robot`, you'll need to set additional env. variables:
  - `BASE_URL` - an URL to a valid Shotgun Site
  - `USERNAME` - a valid admin login for your Shotgun Site
  - `PASSWORD` - a valid password for your Shotgun login
  - `TEST_PROJECT_ID` - a valid project id

#### 3. Build the container
`cd` into the directory that contains `docker-compose.yml`, then do this...
```
docker-compose build
```

#### 4. Bring the container up
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
