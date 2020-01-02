*** Settings ***
# Import the only external library you need
Library             SeleniumLibrary

# Specify a test suite setup and teardown (defined in keywords.common.robot)
Suite setup         Begin Test Suite
Suite Teardown      Quit

*** Variables ***
${BASE_URL}         https://google.com
${BROWSER}          %{BROWSER}
${SEARCHTERM}       Ben Willenbring & doodler & SAAS & scrappy generalist

*** Test Cases ***
Do a google search and click on the top search result
    # Enter a searchterm
    Input Text    css:input[type="text"]    ${SEARCHTERM}
    # Submit the form
    Submit Form
    # Wait for location to change
    Wait Until Location Contains    search?
    # Wait for at least 1 search result to be visible on the page
    Wait Until Element Is Visible    css:div.rc div.r a
    # Click the first search result's link
    Click Element    css:div.rc div.r a
    # Wait for the url to no longer be on google.com
    Wait For Condition    return ! (location.href.includes('google.com'))
    # Wait for the page to be ready
    Wait For Condition    return document.readyState == 'complete'
    # Take a screenshot
    Capture Page Screenshot     searchresult.png


*** Keywords ***
Begin Test Suite
    Open Browser    ${BASE_URL}     ${BROWSER}
    Maximize Browser Window
    Set Selenium Timeout    10
    Set Browser Implicit Wait    30

Quit
    Close All Browsers
