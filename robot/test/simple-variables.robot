*** Settings ***

*** Variables ***
${str}     A sample string...
@{list}     one     two     three   four
&{dict}     first=Ben   last=Willenbring    age=47
${sep}      ------------------------------------------------------------


*** Test Cases ***
Print List Vars
    Print vars



*** Keywords ***
Print vars
    Log To Console      \n${sep}
    Log To Console      4-item list created in Robot...
    Log To Console      ${list}
    Log To Console      ${sep}

    Log To Console      1st item in list...
    Log To Console      @{list}[0]
    Log To Console      ${sep}

    Log To Console      Length of list - evaluated in Python...
    ${len} =            Evaluate    len(@{list})
    Log To Console      ${len}
    Log To Console      ${sep}

    Log To Console      A dictionary created in Robot...
    Log To Console      dict...${dict}
    Log To Console      ${sep}

    Log To Console      One key in the dict...
    Log To Console      first=${dict}[first]
    Log To Console      ${sep}

    Log To Console      All keys in dict - evaluated in Python...
    ${keys} =           Evaluate    ${dict}.keys()
    Log To Console      ${keys}
    Log To Console      ${sep}
