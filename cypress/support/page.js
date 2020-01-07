/**
 * @description Clicks one of the following buttons in the toolbar (`[sg_id="page:root_widget:body:Tlbr"]`):
 * <ul>
 * <li>Sort</li>
 * <li>Group</li>
 * <li>Fields</li>
 * <li>More</li>
 * <li>Pipeline</li>
 * </ul>
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} item - The name of the toolbar button. Does not have to be an exact match, because the locator strategy finds the button with `:contains("${item}")`.
 *
 *
 * @example
 * // From a page of Assets in list mode, click Fields (to show the fields menu)
 * cy.click_toolbar_item('Fields');
 * // Now click Creative Brief (to show this field)
 * cy.handle_menu_item('Creative Brief');
 *
 */

Cypress.Commands.add('click_toolbar_item', function(item) {
    // Assumes you're on an entity query page
    cy.get(`[sg_id="page:root_widget:body:Tlbr"] div.sg_button:contains("${item}")`).click();
});

/**
 * @function get_page
 * @description Gets the page object which contains several callable methods.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 *
 * @returns {Object} `SG.globals.page.root_widget.get_child_widgets()[2]`
 *
 * @example
 * // Get the page, then do stuff...
 * cy.get_page().then(page => {
 *    // find out the page mode
 *    let mode = page.get_mode();
 *    // Get the page's current entity type
 *    let entity_type = page.get_entity_type();
 * })
 *
 */
Cypress.Commands.add('get_page', function() {
    // First, get the global SG object
    cy.get_SG().then($sg => {
        return $sg.globals.page.root_widget.get_child_widgets()[2];
    });
});

/**
 * @function get_grid
 * @description Gets the grid object that contains several callable methods. Important to note:
 * <ul>
 * <li>This is very handy, but...</li>
 * <li>Will only work if the page is in `list` mode</li>
 * <li>Extracts the grid from `SG.globals.page.root_widget`</li>
 * </ul>
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @returns {Object} The `grid_widget` object extracted from `SG.globals.page.root_widget`.
 *
 * @example
 * // Does this and this
 * cy.get_grid().then(grid => {
 *    // Find out how many records are in the grid
 *    let total_recs = grid.get_record_count();
 *    // Set the column header of the code field to Purple
 *    ng.set_column_header_color('code', 6);
 *    // Set wordwrap on the code column
 *    ng.set_wrappaed('code', true);
 * })
 *
 */
Cypress.Commands.add('get_grid', function() {
    // First, get the page...
    cy.get_page().then($page => {
        let ng = $page.get_child_widgets()[0];
        if ($page.get_entity_type() === 'Task' || $page.get_mode() === 'sched') {
            ng = ng.grid_widget;
        }
        return ng;
    });
});

/**
 * @function save_page
 * @description Simulates user clicking Page actions menu, then choosing 'Save Page'. This will fail if the page is not in a dirty state.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @example
 * cy.save_page();
 *
 */
Cypress.Commands.add('save_page', () => {
    cy.get('[sg_selector="button:page_menu"]').should('have.class', 'dirty');
    cy.get('[sg_selector="button:page_menu"]').click();
    cy.handle_menu_item('Save Page');
    cy.wait_for_spinner();
    cy.get('[sg_selector="button:page_menu"]').should('not.have.class', 'dirty');
});

/**
 * @function get_page_id_by_name
 * @description Returns the id of a page by name by calling this REST api endpoint: `/api/v1/entity/pages?fields=name,page_type&sort=name&filter[name]=${page_name}`.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @returns {Number}
 *
 * @example <caption>Navigate to common page URL's without knowing their ID</caption>
 * // My Tasks
 * cy.get_page_id_by_name('My Tasks').then(id => {
 *     cy.navigate_to_page(`/page/${id}`);
 * })
 *
 * // Global People Page
 * cy.get_page_id_by_name('People').then(id => {
 *     cy.navigate_to_page(`/page/${id}`);
 * })
 *
 * // Permissions - People
 * cy.get_page_id_by_name('Permissions - People').then(id => {
 *     cy.navigate_to_page(`/page/${id}`);
 * })
 *
 * // Inbox
 * cy.get_page_id_by_name('Inbox').then(id => {
 *     cy.navigate_to_page(`/page/${id}`);
 * })
 *
 */
Cypress.Commands.add('get_page_id_by_name', function(page_name) {
    let url = `/api/v1/entity/pages?fields=name,page_type&sort=name&filter[name]=${page_name}`;
    cy.get_rest_endpoint(url, 'GET').then($resp => {
        return $resp.body.data[0].id;
    });
});


/**
 * @function handle_menu_item(txt)
 * @description Clicks a menu item by menu item display name. Important to note:
 * <ul>
 * <li>`txt` must be a case-sensitive <i>EXACT MATCH</i></li>
 * <li>Before locating a match, asserts that a menu is visible</li>
 * <li>Iterates over every menu item in the visible menu to locate a match</li
 * <li>Will fail if a match cannot be found</li>
 * </ul>
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} txt - The menu item's display name.
 *
 * @example <caption>Correct</caption>
 * // This succeeds...
 * cy.handle_menu_item('Add Note to Selected...')
 *
 * @example <caption>Incorrect</caption>
 * // All of these will fail
 * cy.handle_menu_item('Add Note to Selected..')
 * cy.handle_menu_item('Add Note to Selected')
 * cy.handle_menu_item('Add note to selected...');
 *
 * @example
 * // Go to the shots page
 * cy.navigate_to_project_page('Shot');
 * // Set mode to list
 * cy.set_page_mode('list');
 * // Click Toolbar => 'More'
 * cy.click_toolbar_item('More');
 * // Select 'Add note to selected'
 * cy.handle_menu_item('Add Note to Selected...');
 *
 */
Cypress.Commands.add('handle_menu_item', function(txt) {
    cy
        .get('div.sg_menu_body span[sg_selector^="menu:"]')
        .filter(function(index) {
            return Cypress.$(this).text() == txt;
        })
        .click();
});


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
 * @function remove_page_summaries
 * @desription Removes page summaries, if they are currently applied to the page by calling the grid js function `grid.toggle_summaries_visible()`.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @example
 * cy.remove_page_summaries();
 *
 */
Cypress.Commands.add('remove_page_summaries', function() {
    // Get the grid
    cy.get_grid().then($grid => {
        if ($grid.summaries_visible()) {
            $grid.toggle_summaries_visible();
        }
    });
});

/**
 * @function ungroup_page
 * @description Ungroups the page by calling `cy.get_grid().invoke('ungroup')`, then calls `cy.wait_for_spinner()`. Important to note:
 * <ul>
 * <li>Will work for single or multi-level grouping</li>
 * <li>Will only work on pages in list mode</li>
 * </ul>
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 *
 * @example
 * // Assume the current page of Tasks is grouped
 * cy.ungroup_page();
 *
 */
Cypress.Commands.add('ungroup_page', function() {
    // Get the grid
    cy.get_grid().invoke('ungroup');
    // Wait for the spinner
    cy.wait_for_spinner();
});


/**
 * @function wait_for_grid
 * @description Makes an assertion that `grid.data_set.loaded == true`.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @example
 * // Go to a page of Tasks
 * cy.navigate_to_project_page('Task');
 * cy.wait_for_grid();
 *
 */
Cypress.Commands.add('wait_for_grid', function() {
    cy.get_grid().its('data_set.loaded').should('eq', true);
});


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


/**
 * @function stow_gantt
 * @description Hides the gantt pane (if it is visible). Assumes the page is either in list mode (for Tasks) or schedule mode (for entities that support Tasks).
 *
 * Also see {@link unstow_gantt cy.unstow_gantt()}.
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @example
 * // Assumes the page of tasks is in list mode
 * cy.stow_gantt();
 *
 */
Cypress.Commands.add('stow_gantt', function() {
    // Assume you are in list or schedule mode
    cy.get_page().then(page => {
        page.get_child_widgets()[0].stow_away_gantt();
    });
});

/**
 * @function unstow_gantt
 * @description Reveals the gantt pane (if it is currently stowed). Assumes the page is either in list mode (for Tasks) or schedule mode (for entities that support Tasks).
 *
 * Also see {@link stow_gantt cy.stow_gantt()}.
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @example
 * // Assumes the page of tasks is in list mode
 * cy.unstow_gantt();
 *
 */
Cypress.Commands.add('unstow_gantt', function() {
    // Assume you are in list or schedule mode
    cy.get_page().then(page => {
        page.get_child_widgets()[0].unstow_away_gantt();
    });
});
