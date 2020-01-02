*** Settings ***
# Import the only external library you need
Library             ntpath

***Keywords***
# --------------------------------------------------------------------------------
# File uploads
# --------------------------------------------------------------------------------
Attach and Upload File
    [Arguments]     ${filepath}
    [Documentation]     Attaches 1 file into a new file entity creation form
    ...
    ...     - Assumes there is a new file entity creation form is already visible
    ...     - Will always submit the form

    # Click the 'Upload' btn
    Click Element    css:.tab[name="upload"] .tab_name
    # Attach file
    Choose File      css:.upload_td input[type="file"]  ${filepath}
    # Submit
    Click Element    css:[sg_selector="button:create"]
    # Wait for progress indicator to appear
    Wait Until Element Is Visible    css:.progress_bar
    # Wait for progress indicator to go away
    Wait Until Element Is Not Visible    css:.progress_bar
    # Verify vellow banner is present
    Wait Until Element Is Visible    css:[sg_selector="label:message"]
    # Verify yellow banner text
    Element Should Contain    css:[sg_selector="label:message"]    has been created.

Attach and Upload Thumbnail
    [Arguments]     ${filepath}
    Wait Until Element is visible   css:form.sg_reset_form
    Choose File     css:form.sg_reset_form input[name="uploaded_data"]  ${filepath}
    Click Element   css:button[sg_selector="button:upload"]
    # Wait for progress indicator to appear
    Wait Until Element Is Visible    css:.progress_bar
    # Wait for progress indicator to go away
    Wait Until Element Is Not Visible    css:.progress_bar
    # ensure the image is not transient...
    Wait for condition      return ! document.querySelector('.project_thumb').style.backgroundImage.includes('transient')


Attach and Upload Billboard
    [Arguments]     ${filepath}
    Choose File    css:input.sg_reset_input.attachment    ${filepath}
    # Click submit
    Sleep    2
    Log To Console    Attempting to click btn .sgc_url_field_dialog .footer button
    # Click Element    css:.sgc_url_field_dialog .footer button
    # Submit form     css:form[enctype="multipart/form-data"]
    Execute Javascript      document.querySelector('.sgc_url_field_dialog .footer button').click()
    # Get the filename of the filepath
    ${filename} =       Get Filename from Path      ${filepath}
    Log To Console    Got filename... ${filename}
    # Wait for progress indicator to appear
    Wait Until Element Is Visible    css:.progress_bar
    # Wait for progress indicator to go away
    Wait Until Element Is Not Visible    css:.progress_bar
    Wait Until Element Is Visible    css:[sg_selector="label:message"]
    Wait Until Element Contains    css:[sg_selector="label:message"]    Billboard updated
    # Ensure the bag image is set
    Wait for condition      return document.querySelector('.billboard.with_background_url').style.backgroundImage.includes(encodeURI('${filename}'))


Get Filename from Path
    [Arguments]     ${filepath}
    ${filename} =       ntpath.basename      ${filepath}
    Return From Keyword    ${filename}
