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
    cy.get_page().then(page => {
        let ng = page.get_child_widgets()[0];
        if (page.get_entity_type() === 'Task' || page.get_mode() === 'sched') {
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
export function save_page() {
    cy.get('[sg_selector="button:page_menu"]').should('have.class', 'dirty');
    cy.get('[sg_selector="button:page_menu"]').click();
    cy.handle_menu_item('Save Page');
    cy.wait_for_spinner();
    cy.get('[sg_selector="button:page_menu"]').should('not.have.class', 'dirty');
}

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
export function get_page_id_by_name(page_name) {
    const url = `/api/v1/entity/pages?fields=name,page_type&sort=name&filter[name]=${page_name}`;
    cy.get_rest_endpoint({url: url}).then($resp => {
        return $resp.body.data[0].id;
    });
}


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
        .get('.sg_menu_body:visible span[sg_selector^="menu:"]')
        .filter(function(index) {
            return Cypress.$(this).text() == txt;
        })
        .click({ force: true });
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
export function remove_page_summaries() {
    // Get the grid
    cy.get_grid().then($grid => {
        if ($grid.summaries_visible()) {
            $grid.toggle_summaries_visible();
        }
    });
}

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

export function ungroup_page() {
    // Get the grid
    cy.get_grid().invoke('ungroup');
    // Wait for the spinner
    cy.wait_for_spinner();
}


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
export function wait_for_grid() {
    cy.get_grid().its('data_set.loaded').should('eq', true);
}


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
export function stow_gantt() {
    // Assume you are in list or schedule mode
    cy.get_page().then(page => {
        page.get_child_widgets()[0].stow_away_gantt();
    });
}

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
export function unstow_gantt() {
    // Assume you are in list or schedule mode
    cy.get_page().then(page => {
        page.get_child_widgets()[0].unstow_away_gantt();
    });
}


/**
 * @function clear_quick_filter
 * @description Simulates clicking the Quick Filter `x` icon to reset the quick filter, then automatically makes a call to `cy.wait_for_spinner()`. See also {@link run_quick_filter cy.run_quick_filter()}.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @example
 * cy.clear_quick_filter();
 *
 */
export function clear_quick_filter() {
    cy.get('div.quick_filter div[sg_selector="button:clear_filter"]').click().then(() => {
        cy.wait_for_spinner();
    });
}


export function select_nth_row_in_grid(index=0) {
    cy.get(`div.row_selector:eq${index}`).click();
    cy.wait_for_spinner();
}


// /* Bring in 2 modules for snake casing and pluralization */
// let snake = require('to-snake-case');
// let pluralize = require('pluralize');




/* ----------------------------------------------------------------------
DIALOGS: Configure Field, Manage Fields, Manage Steps
---------------------------------------------------------------------- */
/**
 * @function invoke_dlg_manage_columns
 * @description Invokes the Manage Columns dialog from an entity query page. This is the dialog that allows users to select 1 or more fields to dsiplay in the grid.
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @example
 * // Go to a Tasks page
 * cy.navigate_to_project_page('Task');
 * // Set page mode to list
 * cy.set_page_mode('list');
 * // Display Task Name and Duration
 * cy.display_fields_in_grid(['content', 'duration']);
 * // Bring up the configure
 * cy.invoke_dlg_manage_columns();
 * // Now the dialog is open and you can check the checkboxes
 */
Cypress.Commands.add('invoke_dlg_manage_columns', function() {
    cy.wait_for_spinner().then(() => {
        // Create selector for the fields button
        let sel = 'div[sg_id="page:root_widget:body:Tlbr"] div.toolbar_item[sg_selector="fields_button"] div.sg_button';

        cy
            .get(sel)
            .click({
                force: true,
            })
            .then(() => {
                // Click Configure Columns
                cy.get("[sg_selector='menu:configure_columns...']").click().then(() => {
                    // Assert dialog is present
                    cy.get('div.sg_new_dialog[sg_id="MngClmnsDlg"]').should('be.visible');
                });
            });
    });
});

/**
 * @function invoke_dlg_manage_fields
 * @description Invokes the Manage Fields dialog. This dialog allows users to toggle field visibility, and also to *create new fields*.
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @example <caption>Simple</caption>
 * // Does this and this
 * cy.invoke_dlg_manage_fields()
 *
 */
Cypress.Commands.add('invoke_dlg_manage_fields', () => {
    cy.wait_for_spinner().then(() => {
        // Create selector for the Fields Button
        let sel = 'div[sg_id="page:root_widget:body:Tlbr"] div.toolbar_item[sg_selector="fields_button"]';
        cy
            .get(sel)
            .click()
            .then(() => {
                // Click Manage Fields menu item
                cy.get('span[sg_selector^="menu:manage_"]').click();
            })
            .then(() => {
                // Assert the dialog is visible...
                cy.get('div[sg_id="dialog:sgd_manage_fields hidden"]').should('be.visible');
            });
    });
});

/**
 * @function invoke_dlg_manage_steps
 * @description Invokes the Manage Pipeline Steps dialog.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @example
 * // Go to a Shots page
 * cy.navigate_to_project_page('Shot');
 * cy.set_page_mode('list');
 *
 * // Invoke the dialog
 * cy.invoke_dlg_manage_steps();
 *
 * // Assert that the dialog header copy is correct
 * cy.get('[sg_selector="label:dialog_header_text"]').should('contain', 'Manage Shot Pipeline Steps');
 *
 */
Cypress.Commands.add('invoke_dlg_manage_steps', function() {
    cy.wait_for_spinner().then(() => {
        // Create selector for the Fields Button
        let sel = 'div[sg_id="page:root_widget:body:Tlbr"] div.toolbar_item[sg_selector="pipeline_button"]';
        cy
            .set_page_mode('list')
            .then(() => {
                cy.get(sel).click();
            })
            .then(() => {
                // Click Manage Steps
                sel = 'div.sg_menu_body span[sg_selector^="menu:manage_"]';
                cy.get(sel).click();
            })
            .then(() => {
                // Assert the dialog is present
                cy.get('div.sgd_manage_steps').should('be.visible');
            });
    });
});

/**
 * @function invoke_dlg_configure_field
 * @description Right-clicks on a single column header of a field, and brings up the `Configure Field` dialog for that field.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} field_name - The system name of the field.
 *
 *
 * @example
 * cy.invoke_dlg_configure_field('sg_status_list');
 * // Now you can drag/reorder the statuses and submit the form
 *
 * @example
 * cy.invoke_dlg_configure_field('updated_by');
 * // Assert there is no 'Delete field' option
 * cy.get('[sg_selector="button:send_to_trash"]').should('not.exist');
 *
 */
Cypress.Commands.add('invoke_dlg_configure_field', field_name => {
    cy.wait_for_spinner();
    // Create the selector specific to the field
    let sel = 'td.heading[sg_selector="label:' + field_name + '"]:visible';
    cy.right_click_on(sel).then(() => {
        cy.get('div.sg_menu span[sg_selector="menu:configure_field..."]').should('be.visible');
        // Calls a function that calls SG.Menu.handle_item_selected
        cy.handle_menu_item('Configure Field...');
    });
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
 * @function invoke_new_entity_form
 * @description Brings up the new entity form for a given entity_type. Must be used from a Shotgun page with a global nav, while logged in.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} entity_type - A valid CamelCase entity type (not the Display Name).
 *
 *
 * @example <caption>Bring up new Project form</caption>
 * cy.invoke_new_entity_form('Project');
 *
 * @example <caption>Bring up new Shot form</caption>
 * cy.invoke_new_entity_form('Shot');
 *
 * @example <caption>Bring up new Task form</caption>
 * cy.invoke_new_entity_form('Task');
 *
 */
Cypress.Commands.add('invoke_new_entity_form', (entity_type = '') => {
    cy.wait_for_spinner().then(() => {
        if (entity_type == '') {
            cy.get_SG().then(SG => {
                SG.globals.page.root_widget.get_child_widgets()[2].create_new_entity();
                // Wait for the new entity form to be present
                cy.get('div.sg_dialog.sg_new_entity_form').should('be.visible');
            });
        } else {
            // Click the plus btn
            cy.global_nav('plus_button').then(() => {
                // Wait for the menu
                cy.get('.sg_menu_body.sg_scroll_area').should('exist').within(menu => {
                    // Click the menu item within the menu whose text is an exact match
                    cy
                        .get('span[sg_selector^="menu:"]')
                        .filter(function(index) {
                            return Cypress.$(this).text() == entity_type;
                        })
                        .click();
                });
            });
        }
    });
});

/* ----------------------------------------------------------------------
IMPORTER
---------------------------------------------------------------------- */

// cy.invoke_importer(entity_type)
// Invokes the importer using the plus button from global nav
Cypress.Commands.add('invoke_importer', function(entity_type = '') {
    cy.wait_for_spinner().then(() => {
        if (entity_type == '') {
            // No entity was passed in, so use the entity type for the page
            cy.get_SG().then(SG => {
                let page = SG.globals.page.root_widget.get_child_widgets()[2];
                page.import_entities();
                // Be extra cautious
                cy.wait_for_spinner().then(() => {
                    cy.get('[data-cy="importer_dialog"]').should('exist');
                });
            });
        } else {
            // An entity type was passed in, so use the Menu
            cy.global_nav('plus_button').then(() => {
                let menu;
                let item_hash;
                cy.get('span[sg_selector="sub_menu:import"]').should('exist');
                //Now use SG code
                cy
                    .get_SG()
                    .then(SG => {
                        menu = SG.Menu.now_showing;
                        // Select 'Import'
                        menu.select_item(0);
                    })
                    .then(() => {
                        // The submenu should now exist
                        // cy.wrap(menu.submenu_instances[0].item_hash).should('be')
                        assert.isObject(menu.submenu_instances[0].item_hash, 'Submenu exists');
                        item_hash = menu.submenu_instances[0].item_hash;
                    })
                    .then(() => {
                        // Find the object index of the entity whose html == entity_type (plural)
                        let item_index = Cypress._.findKey(item_hash, function(o) {
                            return (o.html || o.text) == pluralize.plural(entity_type);
                        });
                        let item = item_hash[item_index];
                        // OK, select that item
                        menu.submenu_instances[0].handle_item_selected(item);
                    })
                    .then(() => {
                        cy.get('[data-cy="importer_dialog"]').should('exist');
                    });
            });
        } // End if
    });
});

Cypress.Commands.add('importer_next', function() {
    cy.get('div.sgc_importer[sg_id="Imprtr"]').within(() => {
        cy.get('input[sg_selector="input.continue"]').click();
    });
});



/* ----------------------------------------------------------------------
GRID FUNCTIONALITY, Column Repositioning, etc.
---------------------------------------------------------------------- */

/**
 * @function set_page_mode
 * @description Sets the page mode to either list, thumbnail, master detail, card, task, or calendar.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} mode - The page mode
 *
 * @example
 * // list
 * cy.set_page_mode('list')
 * // thumb
 * cy.set_page_mode('thumb');
 * // master_detail
 * cy.set_page_mode('master_detail');
 * //
 *
 */
Cypress.Commands.add('set_page_mode', mode => {
    cy.wait_for_spinner();
    switch (mode) {
        case 'thumb':
        case 'thumbnail':
            mode = 'thumb';
            break;

        case 'master_detail':
        case 'detail':
        case 'md':
            mode = 'browser';
            break;

        // Add support for legacy modes
        case 'task':
        case 'sched':
            mode = 'sched';
            break;

        case 'card':
        case 'calendar':
            break;

        // Ensure a sane default mode
        default:
            mode = 'list';
            break;
    }
    cy.get(".mode_switches [sg_selector='button:mode_" + mode + "']").click().then(() => {
        cy.wait_for_spinner();
    });
});

/**
 * @function display_fields_in_grid
 * @description Displays a list of fields in the grid - passed in as an `Array`. Important things to note:
 * <ul>
 * <li>Assumes that the page mode is already set to `list`</li>
 * <li>Does not add the supplied list of fields to the already-displayed fields.</li>
 * <li>Results in ONLY the supplied list of fields being displayed</li>
 * <li>Bubbled fields can be passed in... eg: `entity.Shot.sg_status_list`</li>
 * </ul>
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {Array} field_array - A list of fields to display. This list must be supplied as an `Array`.
 *
 * @example <caption>Shot Code and ALL TASKS pipeline step column</caption>
 * cy.display_fields_in_grid(['code', 'step_0']);
 *
 * @example <caption>Shot fields</caption>
 * // Show Shot code, description, and open notes count fields
 * cy.display_fields_in_grid(['code', 'description', 'open_notes_count']);
 *
 * @example <caption>Version fields & Bubbled Shot Fields</caption>
 * // Show version name, thumbnail, and linked Shot code
 * cy.display_fields_in_grid(['code', 'image', 'entity.Shot.code']);
 *
 */
export function display_fields_in_grid(field_array=[]) {
    cy.wait_for_spinner();
    cy.get_grid().then(ng => {
        // Get columns already shown - pass in true to include Pivot columns
        let cols = ng.get_columns(true);
        // Add new fields, hide old
        ng.change_columns(field_array, cols);
        // As a courtesy, set wordwrap to true on description fields
        ng.set_wrapped('sg_description', true);
        ng.set_wrapped('description', true);
        ng.set_wrapped('code', true);
        ng.resize_column('image', 100);
        ng.resize_column('code', 100);
        // Log total columns visible in grid
        cy.log('Total cols in grid: ' + ng.get_columns(true).length);
        // Assert that each field in the field_array actually exists in the dom as a grid column header
        for (var i = 0; i < field_array.length; i++) {
            cy.get(`.heading[field="${field_array[i]}"]`).should('exist');
        }
    });
    // Call wait_for_spinner once more now that new fields are in the layout
    cy.wait_for_spinner();
}

/**
 * @function move_column
 * @description Moves a grid column - in list mode - to a new 0-based index position. Uses `grid.move_column(idx, 0)`. Allows passing in tokens like `first` and `last`. This command makes no assertions, but may cause js errors if the page is not in list mode.
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} col_name - The system name of the field/column. eg: `sg_status_list`.
 * @param {new_index} - The new index you would like the column to be moved to.
 *
 *
 * @example <caption>Assumes page is already in list mode</caption>
 * // moves code column to 5th position
 * cy.move_column('code', 4)
 *
 * // moves thumbnail to first spot
 * cy.move_column('image','first')
 *
 * // moves status to last spot
 * cy.move_column('sg_status_list', 'last')
 */
export function move_column(col_name, new_index) {
    // Get grid
    cy.get_grid().then(ng => {
        // Get position of the column given
        let idx = ng.get_columns(true).indexOf(col_name);
        // Move it...
        switch (new_index) {
            case 'first':
                ng.move_column(idx, 0);
                break;
            case 'last':
                ng.move_column(idx, ng.get_columns(true).length);
                break;
            default:
                ng.move_column(idx, new_index);
                break;
        }
    });
    cy.wait_for_spinner();
}

/**
 * @function remove_all_step_columns
 * @description Hides all Step Columns on an entity query page by calling `grid.hide_all_task_pivot_columns()`. Makes no assertions, and does nothing if no step columns are visible.
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 *
 * @example
 * // From a page of Shots with 1 or more Step Column groups in the layout
 * cy.remove_all_step_columns();
 *
 */
export function remove_all_step_columns() {
    // Get the grid
    cy.get_grid().then(ng => {
        if (ng.summaries_visible()) {
            ng.hide_all_task_pivot_columns();
        }
    });
}

/**
 * @function step_column_menu_action
 * @description Dispatches a right-click on a step column group header, and invokes a menu item specfici to Pipeline step columns.
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} step=step_0 - The name of the step column (eg: `step_0`)
 * @param {String} menu_action - The name of the menu action to call.
 *
 *
 * @example
 * // Expand ALL TASKS closed step column
 * cy.step_column_menu_action('step_0', 'Expand')
 * @example
 * // Render ALL TASKS in Details only mode
 * cy.step_column_menu_action('step_0', 'Show Details Only')
 *
 */
export function step_column_menu_action(step, menu_action) {
    // First, get the grid
    cy.right_click_on('div.pivot_headers[field="' + step + '"]').then(() => {
        cy.handle_menu_item(menu_action);
    });
}

// Uses the Manage Columns dialog to allow for checkbox selection of fields
// Much slower because of the size of the dom tree that has to be traversed
Cypress.Commands.add('display_fields_in_grid_with_dialog', field_array => {
    cy.invoke_dlg_manage_columns().then($dlg => {
        // Uncheck, then check 'Toggle All'
        let toggle_all = '#sgd_cb_manage_columns_toggle_all';
        let all_chk_boxes = Cypress.$('div.manage_columns_group:first td.manage_columns_checkbox').length;
        cy.log('all fields length :' + all_chk_boxes);
        // Click toggle all once
        cy
            .get(toggle_all)
            .click()
            .then(() => {
                cy
                    .get('div.manage_columns_group:first td.manage_columns_checkbox input:checked')
                    .then($checked_boxes => {
                        expect($checked_boxes).to.have.lengthOf(all_chk_boxes);
                    });
            })
            .then(() => {
                // Check toggle all again
                cy.get(toggle_all).click().then(() => {
                    cy
                        .get('div.manage_columns_group:first td.manage_columns_checkbox input:checked')
                        .should('have.length.of', 0);
                    // ($checked_boxes).to.have.lengthOf(all_chk_boxes);
                });
            })
            .then(() => {
                // Modify your fields array in place to create an aggregate selector
                field_array.forEach(function(part, index, theArray) {
                    theArray[index] = 'div.manage_columns_group:first input[id="sgd_cb_' + part + '"]';
                });
                console.log(field_array.join(','));
                cy.get(field_array.join(',')).click({
                    multiple: true,
                });
            })
            .then(() => {
                // Click apply
                cy.get("[sg_selector='button:apply']").click();
            });
    });
});

/**
 * @function refresh_grid
 * @description Simulates a grid refresh by calling `SG.globals.page.refresh()`.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {Boolean} reload_schema=false - Whether or not to call `SG.schema.reload_schema()` prior to refreshing the grid.
 *
 * @example
 * cy.refresh_grid();
 *
 */
export function refresh_grid(reload_schema = false) {
    cy.wait_for_spinner().then(() => {
        cy.get_SG().then(SG => {
            if (reload_schema == true) {
                SG.schema.reload_schema();
                cy.wait(1500).then(() => {
                    SG.globals.page.refresh();
                    cy.wait_for_spinner();
                });
            } else {
                SG.globals.page.refresh();
                cy.wait_for_spinner();
            }
        });
    });
}

/* --------------------------------------------------
cy.edit_field_in_grid('code', {record_id: 45, new_value:'Tommy'})
-------------------------------------------------- */
/**
 * @function edit_field_in_grid
 *
 * @description Edits a field value in the currently visible grid for a specific entity. Note: this does not make any assertions. This command assumes the following:
 * <ul>
 * <li>The page is already set to list mode</li>
 * <li>The targeted entity `id` is visible in the current grid</li>
 * <li>The targeted field is visible in the current grid</li>
 * <li>The targeted entity does not appear multiple times - as may happen if grouping is applied</li>
 * </ul>
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {Object[]} field - A hash of the following.
 *
 * @param {Number} field.id - The id of the entity to edit.
 *
 * @param {String} field.system_field_name - The system field name of the field you'd like to edit.
 *
 * @param {Object} field.new_value - The field value that should be set (not typed). Appropriate for complex data types like `multi-entity` or `entity` fields.
 *
 * @param {Boolean} field.autocomplete=false - **Optional** - whether or not the editor requires the clicking of a menu item of possible matches.
 *
 *
 * @example <caption>Text</caption>
 * // description (text)
 * cy.edit_field_in_grid({
 *     id: 1167,
 *     system_field_name: 'description',
 *     new_value: 'Lrem ipsum yahda yahdad',
 * });
 *
 * @example <caption>Date</caption>
 * // sg_qa_date (date)
 * cy.edit_field_in_grid({
 *     id: 1167,
 *     system_field_name: 'sg_sg_date',
 *     new_value: 'July 4, 2018'
 * });
 *
 *
 * @example <caption>Multi-entity with matching autocomplete</caption>
 * // shots (multi-entity)
 * cy.edit_field_in_grid({
 *     id: 1167,
 *     system_field_name: 'shots',
 *     new_value: 'foo-shot',
 *     autocomplete: true,
 * });
 *
 */
export function edit_field_in_grid({
    entity_id = null,
    system_field_name ='',
    autocomplete = false
}) {
    // Get the selector to bring the field into edit mode
    let sel = `td.sg_cell[record_id="${field.id}"][field="${field.system_field_name}"] [sg_selector="button:edit_trigger"]`;
    // First, bring the field into edit mode
    cy.get(sel).click({ force: true });
    // Wait for entity editor
    cy.window().its('SG.globals.active_editor').should('exist');
    // Type the input directly into the editor
    cy
        .get('div.entity_editor:last textarea,div.entity_editor:last input')
        .type(field.new_value).then(() => {
            // Determing...
            if (autocomplete) {
                // Click the first autocomplete match
                cy.get('.sg_menu_body match:first').click();
                cy.window().its('SG.globals.active_editor').invoke('blur');
            } else {
                // Blur the editor an be done with it
                cy.window().its('SG.globals.active_editor').invoke('blur');
            }
        })
}

// Simply confirms that the yellow banner for creates, edits, and deletes is presnt
export function confirm_yellow_banner() {
    cy.get('div.sgc_message_box[sg_id="MssgBx"]:visible').should('exist');
    return cy.get('div.sgc_message_box[sg_id="MssgBx"]:visible');
}


export function exit_edit_mode() {
    // Hit double escape to get rid of any hanging editors
    if (Cypress.$('div.entity_editor').length > 0) {
        cy.get('div.entity_editor textarea,div.entity_editor input').type('{esc}{esc}');
    }
}

/**
 * @function run_quick_filter
 * @description Runs a quick filter on an entity query page by typing the passed in text input, and simulates the press of the `{enter}` key. Afterwards, automatically makes a call to `cy.wait_for_spinner()`, then `cy.wait_for_grid()`.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} txt - The text value of the quick filter.
 *
 *
 * @example
 * cy.run_quick_filter('_');
 *
 */
export function run_quick_filter(txt) {
    // Type the text + an enter key
    cy
        .get('input[sg_selector="input:quick_filter"]:last')
        .type(`${txt}{enter}`);
    cy.wait_for_spinner();
    cy.wait_for_grid();
}

Cypress.Commands.add('get_unique_field_name', (entity_type, field_name) => {
    let system_name = 'sg_' + snake(field_name);
    let unique_name = '';
    let temp_field_name = '';
    cy.get_field_names(entity_type).then(fields => {
        if (!fields.includes(system_name)) {
            unique_name = field_name;
        }
        let i = 1;
        while (unique_name == '') {
            temp_field_name = field_name + ' ' + String(i);
            system_name = 'sg_' + snake(temp_field_name);
            i++;
            if (!fields.includes(system_name)) {
                unique_name = temp_field_name;
            }
        }
        return unique_name;
    });
});

Cypress.Commands.add('create_new_field_on_entity_in_ui', (entity_type, field_properties) => {
    let field_name = field_properties.field_name; //eg: Favorite Book
    let system_name = 'sg_' + snake(field_name); //eg: sg_favorite_book
    let field_type = field_properties.field_type; //eg: text, number

    // Optional params: Valid Types: Require for Single Entity Fields
    let valid_types = [];
    if (field_properties.hasOwnProperty('valid_types')) {
        valid_types = field_properties.valid_types;
    }
    // Bring up new field dialog
    cy.invoke_dlg_manage_fields().then(() => {
        //Click 'new Field'
        cy.get('div[sg_selector="button:add_field"]').trigger('mouseover').click().then(() => {
            // The New Field Creation dialog is now visible
            // Name the field
            cy.get('input[sg_selector="input:field_name"]').type(field_name);
            // choose Field Type of field_type
            cy.get('input[sg_selector="radio:' + field_type + '"]').check().then(() => {
                // Now select Valid Types (if this applies)
                // For multi-entity as well as single-entity field configs
                if (valid_types.length > 0) {
                    // Transform the array
                    valid_types.forEach(function(part, index, theArray) {
                        let v = 'input[id="' + part + '"]';
                        console.log(v);
                        theArray[index] = v;
                    });
                    // Now join the array
                    cy.get(valid_types.join(',')).click();
                    // given this: ['episode', 'asset']
                    // make this: input[sg_selector="radio:episode"],
                }
                //Click Next button
                cy.get('button[sg_selector="button:next"]').click().then(() => {
                    //Wait for Secondary dialog
                    cy.get('div[sg_id="dialog:sgd_apply_to_projects"]').should('exist');
                    // All Projects should be checked
                    cy.get('input[name="sgd_apply_to_projects_option"][value="all"]').should('be.checked');
                    //Now, click 'Create Field'
                    cy.get('button[sg_selector="button:create_field"]').click().then(() => {
                        //Configure field dialog should be present
                        cy
                            .get('div.progress_indicator_overlay div.title')
                            .contains('Configuring Field...')
                            .should('exist');
                        //Click 'Done'
                        cy.get('button[sg_selector="button:done"]').click().then(() => {
                            //If you're here, you succeeded
                            cy.get_SG().then(SG => {
                                return SG.schema.entity_fields[entity_type][system_name];
                            });
                        });
                    });
                });
            });
        }); // end cy.get('footer_buttons...')
    }); // end cy.invoke_dlg_manage_fields
});
