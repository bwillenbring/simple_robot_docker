*** Settings ***
Library          OperatingSystem

*** Test Cases ***
Run a Selenium Test through Robot that is expected to fail
    # Set env variables with failing values - to be picked up inside of selenium1.py
    Set Bad Environment Variables
    # Run the selenium test, and store the exit code in ${status}
    ${status} =     Run And Return Rc     python libraries/selenium1.py
    Log To Console    Python returned an exit code of ${status}
    # Assert that the selenium test returned a 1 exit code
    Should Be Equal As Integers    ${status}    1


*** Keywords ***
Set Bad Environment Variables
    # Note: These values will guarantee failure
    Set Environment Variable    USERNAME    ******
    Set Environment Variable    PASSWORD    ******
    Set Environment Variable    BROWSER     chrome
    Set Environment Variable    BASE_URL    https://bwillenbring1.shotgunstudio.com
