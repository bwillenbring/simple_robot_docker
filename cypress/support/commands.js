// Wait Until
import 'cypress-wait-until'

/**
 * function log
 * @description Overwrites the builtin `cy.log(message)` function, and sends `message`
 * to the terminal window that spawned the cypress process. It does this by calling a
 * custom task defined in `plugins/index.js`. Logging will continue to show up in the test runner.
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param message - Number, String, Bool, Array, or Object to print.
 *
 * @returns true
 *
 * @example
 * // Print a string to the terminal
 * cy.log('Some String');
 *
 * // Print a JSON Object
 * cy.fixture('/query_fields/single_record_thumbnail.json').then(config => {
 *     cy.log(config);
 * })
 *
 */
Cypress.Commands.overwrite('log', (originalFn, message, options) => {
    cy.task('append_log', message).then(() => {
        return originalFn(message, options)
    })
})

Cypress.Commands.add('wait_for_page_to_load', () =>
    cy.document().its('readyState').should('eq', 'complete')
)

Cypress.Commands.add('run_python_script', (script, args) => {
    // Accepts 2 args:
    //  1) script - name of the python file located in /fixtures/python/
    //  2) args - string of args to pass to the python script
    // example: run_python_script('sample_python_hook.py', '--name Carl Bass')
    // It is assumed your python script will have an argparse code snippet to
    // handle whatever --arg(s) you pass in.
    // See sample_python_hook.py for an example of this.
    let default_args =
        '-baseUrl ' +
        Cypress.config('baseUrl') +
        ' ' +
        '-admin_login ' +
        Cypress.config('admin_login') +
        ' ' +
        '-admin_pwd ' +
        Cypress.config('admin_pwd')

    switch (args) {
        case undefined:
        case null:
        case '':
            args = default_args
            break
        default:
            //args is a non-empty string
            args = default_args + ' ' + args
            break
    }
    // Now execute the python, and grab the printed output
    let cmd_string = 'python fixtures/python/' + script + ' ' + args
    cy.exec(cmd_string).then(($resp) => {
        //Trap and return the printed output in the .stdout
        return $resp.stdout
    })
})

// Require mochawesome's addContext submodule
const addContext = require('mochawesome/addContext')
/**
 * @function addTestContext
 * @description Documentation-related helper method. Allows test writers to inserts text, images, or links into mochawesome-reports generated from Cypress specs being run. More available <a href="https://www.npmjs.com/package/mochawesome#addcontexttestobj-context">here</a>.
 * - Calling this command must be done within a test case block (it)
 * - 1 test case can contain multiple instances of `cy.addTestContext()`
 * - Calls will work with 1 arag or 2; if 1 arg is supplied, it must be a `string`
 * - Links, images, and videos will automatically render inline when displayed in html reports
 *
 * @param {String} title - A string. If no `value` is provided, this parameter will be treated as content in the mochawesome report. If a 2nd parameter (`value`) is provided, then `title` will be treated as a label.
 * @param {String|Number|Boolean|Array|Object} value - An optional value of any type.
 *
 * @example
 * --------------------
 * // Prints a Jira ticket(as a link)
 * cy.addTestContext('https://jira.autodesk.com/browse/SG-17109');
 * --------------------
 * // Prints a Jira ticket (as a link) with accompanying label
 * cy.addTestContext('Related Ticket', 'https://jira.autodesk.com/browse/SG-17109');
 * --------------------
 * // Embed an image inline
 * cy.addTestContext('http://cdn.makeagif.com/media/4-07-2015/87W1i8.gif');
 * // Embed an image inline with accompanying label
 * cy.addTestContext('Animated gif', 'http://cdn.makeagif.com/media/4-07-2015/87W1i8.gif');
 * --------------------
 * // Usages that will fail
 * cy.addTestContext(false); // Doesn't print - only works with 2 args (title, value)
 * cy.addTestContext(55); // Doesn't print - only works with 2 args (title, value)
 * cy.addTestContext({ foo: 'bar' }); // Doesn't print - only works with 2 args (title, value)
 * cy.addTestContext('<b>Inline html</b>'); // This prints - but is ALWAYS escaped (never interpreted)
 *--------------------
 */
Cypress.Commands.add('addTestContext', function (title, value = null) {
    if (!value) {
        cy.once('test:after:run', (test) => addContext({ test }, title))
    } else {
        cy.once('test:after:run', (test) =>
            addContext({ test }, { title, value })
        )
    }
})

Cypress.Commands.add(
    'attach_file',
    { prevSubject: 'element' },
    (input, fileName, fileType) => {
        cy.fixture(fileName)
            .then((content) =>
                Cypress.Blob.base64StringToBlob(content, fileType)
            )
            .then((blob) => {
                const testFile = new File([blob], fileName)
                const dataTransfer = new DataTransfer()
                dataTransfer.items.add(testFile)
                input[0].files = dataTransfer.files
                return input
            })
    }
)
