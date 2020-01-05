***Keywords***
# --------------------------------------------------------------------------------
# New entity forms
# --------------------------------------------------------------------------------
Invoke New Entity Form
    [Arguments]     ${entity}
    Log To Console    Opening new entity form for... ${entity}
    # Click + button
    Click Element    css:#sg_global_nav [sg_selector="plus_button"]
    # Wait for the menu to be visible
    Wait Until Element Is Visible    css:div.sg_menu
    # Scroll...
    Scroll Element Into View    css:span.sg_menu_item_content[sg_selector="menu:asset"]
    # Click...
    Click Element    css:span.sg_menu_item_content[sg_selector="menu:${entity}"]
    # Get the correct selector (there are 2 variants)
    ${selector} =   Run Keyword    Get New Entity Form Selector
    Wait Until Element Is Visible    css:${selector}

Close New Entity Form
    ${selector} =   Run Keyword    Get New Entity Form Selector
    Click Element   ${selector} [sg_selector="button:cancel"]

Get New Entity Form Selector
    ${selector} =   Execute Javascript      return (document.querySelectorAll('[sg_id="dialog:sgd_new_project"]').length > 0) ? 'css:[sg_id="dialog:sgd_new_project"]' : 'css:[sg_id="NwEnttyDlg:CllMngr"]'
    Return From Keyword    ${selector}
    Evaluate    expression

Toolbar => Plus Button
    Click Element   css:.entity_query_page_toolbar span.plus
    # Get the correct selector (there are 2 variants)
    ${selector} =   Run Keyword    Get New Entity Form Selector
    Wait Until Element Is Visible    ${selector}
