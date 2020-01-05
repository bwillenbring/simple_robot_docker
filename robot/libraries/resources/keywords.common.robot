*** Keywords ***
Begin Test Suite
    Launch Browser  ${BASE_URL}     ${BROWSER}

Launch Browser
    [Arguments]     ${BASE_URL}     ${BROWSER}
    Open Browser    ${BASE_URL}     ${BROWSER}
    Set Browser Implicit Wait    10 seconds
    Set Selenium Timeout    10 seconds
    Maximize Browser Window

Quit
    Close All Browsers

Navigate To Project Page
    [Arguments]     ${entity_type}
    Go To   ${baseUrl}/page/project_default?entity_type=${entity_type}&project_id=${TEST_PROJECT_ID}
    Wait For Ready State

Navigate To Project Overview Page
    Go To   ${baseUrl}/page/project_overview?project_id=${TEST_PROJECT_ID}
    Wait For Ready State

Wait For Ready State
    Wait For Condition    return document.readyState=='complete'

# --------------------------------------------------------------------------------
# ⬇ Page Layout Manipulation ⬇
# --------------------------------------------------------------------------------
Set Page Mode
    [Arguments]     ${mode}
    ${current_mode} =   Get Current Page Mode
    Log To Console      Current mode is ... ${current_mode}
    Run Keyword If    ${mode} != ${current_mode}    Click Element   css:[sg_selector="button:mode_${mode}"]


Get Current Page Mode
    ${mode} =   Execute Javascript  return SG.globals.page.root_widget.get_child_widgets()[2].get_mode()
    Return From Keyword    ${mode}


Wait for Progress Indicator to Appear and Go Away
    # Wait for progress indicator to appear
    Wait Until Element Is Visible    css:.progress_bar
    # Wait for progress indicator to go away
    Wait Until Element Is Not Visible    css:.progress_bar


Wait for Yellow Banner
    Wait Until Element Is Visible    css:[sg_selector="label:message"]


Wait for Yellow Banner to Contain
    [Arguments]     ${msg}
    Wait for Yellow Banner
    Wait Until Element Contains    css:[sg_selector="label:message"]    ${msg}
