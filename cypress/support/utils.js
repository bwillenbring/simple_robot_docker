/* ----------------------------------------------------------------------
Utility functions
---------------------------------------------------------------------- */

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


/**
 * @function get_SG
 * @description Gets the SG object that should exist on all Shotgun pages.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @returns {Object} `SG`
 *
 * @example <caption>Using `.then`</caption>
 * cy.get_SG().then(SG => {
 *     assert.isTrue(SG.globals.current_user.id > 0);
 * })
 *
 * @example <caption>Using `.its`</caption>
 * cy.get_SG().its('globals.current_user.id').should('be.above', 0)
 *
 */
Cypress.Commands.add('get_SG', function() {
    cy.window().then($win => {
        let SG = $win.SG;
        return SG;
    });
});



// cy.is_logged_in()
// returns true or false - whether
Cypress.Commands.add('is_logged_in', function() {
    cy.get_SG().then(SG => {
        try {
            return SG.globals.current_user.id > 0;
        } catch (err) {
            return false;
        }
    });
});

// cy.get_random_int(5, 50);
// Returns a random int between 5 and 50
Cypress.Commands.add('get_random_int', function(min, max) {
    // Returns a random integer between min and max
    let n = Math.floor(Math.random() * (max - min + 1)) + min;
    return n;
});

// cy.get_session_uuid()
// Returns the string containing the current user's session_uuid
Cypress.Commands.add('get_session_uuid', function() {
    cy.get_SG().then(SG => {
        return SG.globals.session_uuid;
    });
});

// cy.get_csrf_token_name()
// Returns the name of the user-based cookie. Example: csrf_token_u42
Cypress.Commands.add('get_csrf_token_name', function() {
    return 'csrf_token_u' + Cypress.config('admin_id');
});

// cy.get_csrf_token_value('crsf_token_u42')
// Expects a string with the name of the user-based csrf cookie
// Returns the VALUE of the user-based csrf cookie
Cypress.Commands.add('get_csrf_token_value', function() {
    cy.get_csrf_token_name().then(csrf => {
        console.log(csrf);
        return Cypress.config(csrf);
    });
});


/* ----------------------------------------------------------------------
Right Clicking
---------------------------------------------------------------------- */
/**
 * @function right_click_on
 * @description Attempts to invoke a Shotgun context menu on the dom element that is passed in as `selector`, then calls `cy.wait_for_spinner()`. This command makes no assertions, so has a low likelihood of failure even in the absence of a context menu. It works well on entity query pages for...
 * <ul>
 * <li>Column headers</li>
 * <li>Row selectors</li>
 * </ul>
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} selector - The selector that you wish to target the right-click.
 *
 * @example
 * // Go to a Shots page
 * cy.navigate_to_page('Shot');
 * // Set page mode to list
 * cy.set_page_mode('list');
 * // Display the Shot Name and Description fields
 * cy.display_fields_in_grid(['code', 'description']);
 * // Right-click on the Description header
 * cy.right_click_on('td.heading[sg_selector="label:description"]');
 * // Assert that the Configure field menu item is showing
 * cy.get('.sg_menu_body:contains("Configure Field")').should('be.visible');
 *
 */
Cypress.Commands.add('right_click_on', selector => {
    cy.wait_for_spinner().then(() => {
        // Make sure the element is visible...
        cy.get(selector).should('be.visible');
        cy
            .get(selector)
            .trigger('contextmenu', {
                bubbles: true,
                force: true,
            })
            .then(() => {
                cy.wait_for_spinner();
            });
    });
});


Cypress.Commands.add('typeTab', (shiftKey, ctrlKey) => {
    cy.focused().trigger('keydown', {
        keyCode: 9,
        which: 9,
        shiftKey: shiftKey,
        ctrlKey: ctrlKey,
    });
});
