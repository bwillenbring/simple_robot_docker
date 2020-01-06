/**
 * @function wait_for_page_to_load
 * @description Waits for document.readyState to equal `complete`. Also calls `cy.wait_for_spinner()`
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @example
 * // Assume you're logged in
 * // Use cy.visit() to go to home page
 * cy.visit('')
 * cy.wait_for_page_to_load();
 *
 */
export function wait_for_page_to_load() {
    cy.document().its('readyState').should('eq', 'complete');
    cy.wait_for_spinner();
}

/**
 * @function home
 * @description Navigates to the configured home page.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @example <caption>Simple</caption>
 * // Login, then go Home
 * cy.login_as('admin');
 * cy.home();
 *
 */
export function home() {
    cy.navigate_to_page('');
}

/**
 * @function navigate_to_page
 * @description Navigates to a Shotgun page. Does some pre-checks, wraps `cy.visit()`, and ensures that the page is ready after navigation has occurred.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} page - The portion of the Shotgun URL excluding the `baseUrl`. Examples below.
 *
 * @example
 * // Go to the main projects page
 * cy.navigate_to_page('/projects/');
 *
 * // Account Settings
 * cy.navigate_to_page('/page/account_settings')
 *
 * // Page 882
 * cy.navigate_to_page('/page/882')
 *
 */
export function navigate_to_page(page='') {
    // First, make sure that the user has not just passed in a number
    page = Number(page) > 0 ? `/page/${page}` : page;

    let w = 500;
    let loaded = false;
    if (!page.startsWith('detail/') && !page.startsWith('/detail/')) {
        // It's not a detail page
        switch (page) {
            case '':
                break;
            case 'preferences':
            case '/preferences':
                page = '/preferences';
                break;
            default:
                page = String(page);
                page = page.substring(page.indexOf('/page') + 1);
                if (!page.includes('page/')) {
                    page = 'page/' + page;
                }
                break;
        }
    }
    // Visit the page
    cy
        .visit(page, {
            onLoad: win => {
                // console.log('typeof win.sg...' + typeof win.SG);
                let thumb = Cypress.$('div.sg_user_thumb');
                if (!thumb.is(':visible')) {
                    console.log('reload!');
                } else {
                    loaded = true;
                }
            },
            failOnStatusCode: false,
        })
        .then(() => {
            if (loaded == false) {
                cy.wait(w).then(() => {
                    cy.navigate_to_page(page);
                });
            } else {
                console.log('stay put!');
                cy.wait_for_spinner().then(() => {
                    cy.wait(1000);
                });
            }
        })
        .then(() => {
            // Extra cautious step for Rails UI tests
            cy.wait_for_spinner();
        });
}

/**
 * @function navigate_to_project_page
 *
 * @description Navigates to an official Project entity query page for the given `entity_type` within the configured `TEST_RPOJECT`. It does this by calling `cy.navigate_to_page` and passing in the following param:
 * ```
 * '/page/project_default?entity_type=' + entity_type + '&project_id=' + Cypress.config('TEST_PROJECT').id;
 * ```
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} entity_type - The CamelCase entity type in singular form.
 *
 * @example
 * // Shots page without knowing the id in advance
 * cy.navigate_to_project_page('Shot');
 *
 // Go to the Tasks page
 * cy.navigate_to_project_page('Task');
 */
export function navigate_to_project_page(entity_type='') {
    let redirect = false;
    let url = `/page/project_default?entity_type=${entity_type}&project_id=${Cypress.config('TEST_PROJECT').id}`;
    if (entity_type === 'Media' || entity_type === 'media') {
        url = '/page/media_center?&project_id=' + Cypress.config('TEST_PROJECT').id;
    }
    cy.navigate_to_page(url);
}

/**
 * @function wait_for_spinner
 * @description Defensively checks to see if the page is loaded, and if necessary, reloads it. If the page is loaded, it will waits for the spinner to go away.
 * <ul>
 * <li>First, make an assertion that the spinner is not visible - eg: <br/>`cy.get('[data-cy="overlay-spinner"]').should('not.be.visible')`<br/><br/></li>
 * <li>Next, If the page has no global nav, or there is no text content...
 * <ul>
 * <li>call `cy.reload()` - and take no further defensive actions</li>
 * <li>Otherwise, call `grid.hide_loading_overlay()` - and take no further defensive actions</li>
 * </ul>
 * </li>
 * </ul>
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @example
 * cy.wait_for_spinner();
 *
 */
export function wait_for_spinner() {
    if (Cypress.$('[data-cy="overlay-spinner"]').length > 0) {
        // Assert the spinner is not visible
        cy.get('[data-cy="overlay-spinner"]').should('not.be.visible');
    }
}

/**
 * @function global_nav
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 * @description Clicks common global nav elements by building a selector from the passed in param `item`, and mapping it to an items dictionary of allowed values.
 *
 * **How `item` maps to a selector**
 * ```
 * let items = {
 *     home: 'shotgun_logo',
 *     inbox: 'inbox',
 *     my_tasks: 'my_tasks',
 *     media: 'media',
 *     projects: 'projects_popover_button',
 *     pages: 'global_pages_overlay_button',
 *     people: 'people_button',
 *     apps: 'apps_button',
 *     user_thumbnail: 'button:user_account',
 *     plus_button: 'plus_button',
 *     plus: 'plus_button',
 *     plus_btn: 'plus_button',
 *     '+': 'plus_button',
 * };
 * cy.get("[sg_selector='" + items[item] + "']").click();
 * ```
 *
 * @param {String} item - The human-readable string that corresponds to commonly clicked on items in the global nav.
 *
 * @example
 * cy.global_nav('plus_button');
 *
 */
export function global_nav(item='plus_button') {
    const items = {
        home: 'shotgun_logo',
        inbox: 'inbox',
        my_tasks: 'my_tasks',
        media: 'media_center',
        projects: 'projects_popover_button',
        pages: 'global_pages_overlay_button',
        people: 'people_button',
        apps: 'apps_button',
        user_thumbnail: 'button:user_account',
        plus_button: 'plus_button',
        plus: 'plus_button',
        plus_btn: 'plus_button',
        '+': 'plus_button',
    };
    cy.get(`[sg_id="GlblNv"] [sg_selector="${items[item]}"]`).click();
}
