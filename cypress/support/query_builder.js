
export function filter_panel_is_visible() {
    // Return true or false
    return Cypress.$("[sg_id='filter_panel']").length > 0;
}

export function filter_panel_is_docked() {
    // Return true or false
    // return Cypress.$("[sg_selector='docked_filter_panel']").length > 0;
    cy.get_page().then(page => {
        return page.is_filter_panel_docked();
    })
}

export function filter_panel_has_filters() {
    return Cypress.$("[sg_selector='button:clear_filters']:contains('No filters applied')").length > 0;
}

export function dock_filter_panel() {
    // First, expand the filter panel
    // cy.expand_filter_panel();
    // cy.get("[sg_selector='button:dock_panel']").click();

    cy.filter_panel_is_docked().then(docked => {
        if (! docked) {
            // Dock it
            cy.get("[sg_selector='button:dock_panel']").click();
        }
    })
}


export function expand_filter_panel() {
    cy.filter_panel_is_visible().then(fp_is_visible => {
        if (fp_is_visible == false) {
            cy.get("[sg_selector='filter_panel_button']:last").click();
        } else {
            // Is it visible and docked?
            cy.filter_panel_is_docked().then(docked => {
                if (! docked) {
                    cy.dock_filter_panel();
                }
            })
        }
    });
}

export function click_new_filter() {
    cy.wait_for_spinner().then(() => {
        cy.get("[sg_selector='button:new_filter']").click();
    });
}

export function save_filter() {
    cy.get("[sg_id='saved_filter_panel'] [sg_selector='button:submit']").click();
    cy.wait_for_spinner();
}

export function create_new_filter({
    name = 'Cypress filter',
    match_type = 'all',
    options = {
        filters: [],
        disable_standard_project_condition: false,
        save_filter: true
    }
} = { }) {
    // 1. Make sure the filter panel is open, and a new filter widget is exposed
    cy.expand_filter_panel();

    // 2. Click + new filter
    cy.click_new_filter();

    // 3. Type the filter name
    cy.get("[sg_id='saved_filter_panel'] [sg_selector='input:name']").type(name);

    // 4. Choose the global filter match type
    cy.get("[sg_selector='dropdown:query_condition']:first").select(match_type);

    // 5. Iterate over each of the passed in filters
    cy.wrap(options['filters']).each($filter => {
        // 5. Click the LAST + button (which could also be the only one)
        cy.get("[sg_selector='button:plus']:last").click().then(() => {
            //Stay within the correct filter row
            cy.get('tr.condition_row:last').then($row => {
                // Expand the fields menu
                cy.wrap($row).find('.condition_column_col .sg_menu_dropdown').click();

                // Click the field name in the fields menu
                // expects field name to match: Date Created
                // does not expect: date_created
                cy.handle_menu_item($filter[0]);
                cy.wrap($row).find('.condition_type_select').click();
                cy.get("div.sg_menu_body:visible [sg_selector='menu:" + $filter[1] + "']").click();

                // Select the filter value(s)
                cy.wrap($row).find('.condition_value').click();
                let val = $filter[2];

                // Handle the possibility of autocomplete
                if ($filter.length > 3 && $filter[3].hasOwnProperty('autocomplete') && $filter[3].autocomplete == true) {
                    // Type the value into the editor
                    cy
                        .get('div.entity_editor input,div.entity_editor textarea, input.date_editor')
                        .type($filter[2]);

                    // Wait for the autocomplete dropdown
                    cy.get('.entity_editor_listbox').should('be.visible');
                    // Click the first autocompleted match...
                    cy.get('.entity_editor_listbox match:first').click();
                    // The matched brick should appear in the entity editor
                    cy.get('[sg_id="entity_editor"] .entity_editor_matched').should('be.visible');
                }
                else {
                    // Type the value into the filter value input
                    cy
                        .get('div.entity_editor input,div.entity_editor textarea, input.date_editor')
                        .type($filter[2])
                        .trigger('keydown', {
                            keyCode: 9,
                            which: 9,
                        });
                }

            }); //end cy.get("tr.condition_row:last")
        }); // end cy.get("[sg_selector='button:plus']:last")
    }); //end cy.wrap(options["filters"]).each

    if (options.disable_standard_project_condition) {
        cy.disable_standard_project_condition();
    }

    //Now, you have to save the filter
    cy.save_filter();
}


export function disable_standard_project_condition() {
    cy.get('#page_project_condition_gear_menu').click();
    cy.handle_menu_item('Disable Standard Page Project Condition');
}

export function get_page_filter_panel() {
    return Cypress.$(".sgc_filter_panel[filter_panel_type='main']");
}
