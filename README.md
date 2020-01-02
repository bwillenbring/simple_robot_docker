# Barebones Robot Docker Container
Runnable tests with example test files for...
- Robot keyword only tests (using `SeleniumLibrary`)
- Robot keyword + Python scripts (using `robot.libraries.BuiltIn` and `robot.api.deco`)
- Python only selenium tests - callable from Robot, or as standalone files


----

## How to Use this repo
In addition to `git` you need is `Docker 18.06` or higher. [Install it here](https://www.google.com).
#### 1. Clone the repo locally
```
git clone https://github.com/bwillenbring/simple_robot_docker.git
```

#### 2. Modify `docker-compose.yml` in these ways: <br/>

| Env. Variable | Notes |
| ------------- | ----- |
| `BASE_URL` | An URL for a valid Shotgun Site |
| `BROWSER` | One of the following: `chrome` or `firefox` (in lowercase)|
| `USERNAME` | A valid admin username for your Shotgun site. |
| `PASSWORD` | A valid password for your Shotgun username. |
| `TEST_PROJECT_ID` | A valid Shotgun project id. |

#### 3. Build the container
`cd` into the directory that contains `docker-compose.yml`, then do this...
```
docker-compose build
```
