*** Settings ***
# Import the only external library you need
Library             SeleniumLibrary
Library             OperatingSystem

# Import keyword files that contain the logic for your Test Case actions...
Resource            ../libraries/resources/keywords.common.robot
Resource            ../libraries/resources/keywords.file_uploads.robot
Resource            ../libraries/resources/keywords.login.robot
Resource            ../libraries/resources/keywords.new_entity_forms.robot

# Specify a test suite setup and teardown (defined in keywords.common.robot)
Suite setup         Begin Test Suite
Suite Teardown      Quit

*** Variables ***
${BASE_URL}         %{BASE_URL}
${BROWSER}          %{BROWSER}
${USERNAME}         %{USERNAME}
${PASSWORD}         %{PASSWORD}
${TEST_PROJECT_ID}  %{TEST_PROJECT_ID}

*** Test Cases ***
Login
    Login   ${USERNAME}     ${PASSWORD}

Go to the Files Page and Upload a JPG
    Navigate To Project Page    Attachment
    Set Page Mode    list
    Toolbar => Plus Button
    Attach and Upload File  ${EXECDIR}/fixtures/test.jpg
    Capture Page Screenshot     files_page_file_upload.jpg


Go to the Project Overview Page and upload a Billboard image
    Navigate To Project Overview Page
    Mouse Over    css:.billboard_click_target
    Click Element   css:.billboard_click_target .billboard_prompt
    Attach and Upload Billboard     ${EXECDIR}/fixtures/pipeline.jpg
    Capture Page Screenshot     proj_overview_with_billboard.jpg


Go to the Project Overview Page and upload a Project Thumbnail
    Navigate To Project Overview Page
    Mouse Over    css:.sgw_project_overview_page .project_thumb_wrapper .project_overview_prompt
    Sleep    1
    Click Element    css:.sgw_project_overview_page .project_thumb_wrapper .project_overview_prompt
    Attach and Upload Thumbnail     ${EXECDIR}/fixtures/thumb.jpg
    Capture Page Screenshot     proj_overview_with_thumbnail.jpg


Go to the Project Overview Page and upload multiple images in a note attachment
    Navigate To Project Overview Page
    # Type into the first note textarea
    Input Text    css:.note_form [field="content"] textarea    This is a test note from Robot.
    # Get the id of the containing element
    ${id} =     Execute Javascript    return document.querySelector('.note_form [field="content"]').parentElement.parentElement.id
    # Click paperlip icon
    Click Element    css:#${id} .icon_paperclip
    # Attach 1st file
    Choose File    css:#${id} input[name="upload_1[]"]    ${EXECDIR}/fixtures/thumb.jpg
    # Click 'attach more'
    Click Element    css:#${id} .upload_more
    # Attach 2nd file
    Choose File    css:#${id} input[name="upload_1[]"]    ${EXECDIR}/fixtures/test.jpg
    # Submit the form
    # Click Element    css:#${id} [sg_selector="button:submit"]
    Click Element    css:.note_form [sg_selector="button:submit"]
    # Wait for the spinner to appear and go away
    Wait for Progress Indicator to Appear and Go Away
    # Get the note ID - not the DOM element's id
    ${note_id} =    Execute Javascript  return document.querySelector('.sgc_note_thread_base[record_id]').getAttribute('record_id')
    Log To Console    Note id is... ${note_id}
    # Wait for there to be exactly 2 image attachments rendered into the top-most note thread
    Wait For Condition    return document.querySelectorAll('.sgc_note_thread_base[record_id="${note_id}"] .image_attachments img').length == 2
    Sleep    1
    Capture Page Screenshot     proj_overview_with_note_attachments.png

*** Keywords ***
