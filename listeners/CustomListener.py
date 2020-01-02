from robot.libraries.BuiltIn import BuiltIn

ROBOT_LISTENER_API_VERSION = 3
# ----------------------------------------------------------------------
# Robot Listener Events below, which eavesdrop on test execution
# ----------------------------------------------------------------------
def start_suite(name, result):
    """This code runs at the beginning of the test suite."""
    print ("Robot test suite is starting...")


def start_test(name, attributes):
    """This code runs at the beginning of EVERY test case in the test suite."""


def end_test(name, attributes):
    """
    This code runs at the conclusion of EVERY test case in the test suite.

    name, attributes
    	id:
    	doc: Same as in start_test.
    	tags: Same as in start_test.
    	critical: Same as in start_test.
    	starttime: Same as in start_test.
    	endtime: Test execution execution end time.
    	elapsedtime: Total execution time in milliseconds as an integer
    	status: Test status as string PASS or FAIL.
    	message: Status message. Normally an error message or an empty string.
    """


def end_suite(name, result):
    """This code runs as soon as the suite ends."""
    print("Robot test suite has ended...")


def report_file(path):
    """This code executes when the report.html file has been written to disk."""
