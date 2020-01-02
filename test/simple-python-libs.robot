*** Settings ***
# Import the only external library you need
Library             ntpath

*** Test Cases ***
Print a file name from a file path
    ${filepath} =       Set Variable    foo/doo/woo/something.jpg
    ${filename} =       ntpath.basename      ${filepath}
    Log To Console    ${filepath}
    Log To Console    ${filename}

*** Keywords ***
