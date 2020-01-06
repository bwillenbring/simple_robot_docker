***Keywords***
# --------------------------------------------------------------------------------
# Logging in...
# --------------------------------------------------------------------------------
Login
    [Arguments]     ${USERNAME}     ${PASSWORD}
    Go To   ${BASE_URL}/user/login
    Input Text    id:user_login    ${USERNAME}
    Input Text    id:user_password    ${PASSWORD}
    Submit Form
    # Wait until you're past the login form
    Wait For Condition    return ! top.location.href.includes('/user/login')
    Wait Until Element is visible   id:sg_global_nav
    # Wait until your Shotgun session is created
    Wait For Condition    return SG.globals.current_user.id > 0 && document.readyState == 'complete'
    # ${id} =     Execute Javascript    return SG.globals.current_user.id
