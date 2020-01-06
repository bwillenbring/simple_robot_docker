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
        return originalFn(message, options);
    });
});
