export function invoke_new_entity_form(entity_type = '') {
    cy.wait_for_spinner();
    if (entity_type === '') {
        cy.get_SG().then(SG => {
            SG.globals.page.root_widget.get_child_widgets()[2].create_new_entity();
            // Wait for the new entity form to be present
        });
    } else {
        // Click the plus btn
        cy.global_nav('plus_button');
        // Click the menu item corresponding to the entity_type
        cy.handle_menu_item(entity_type);
    }
}

/**
 * Sets a field value in the currently visible new entity form. Will work with the following data types:
 * <ul>
 * <li>Date</li>
 * <li>Duration</li>
 * <li>Entity</li>
 * <li>List</li>
 * <li>Number</li>
 * <li>Status List (pass in the short code)</li>
 * <li>Text</li>
 *</ul>

 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} fld - The system name of the field you wold like to edit.
 * @param {String} val - The value you would like to apply.
 *
 * @example <caption>Sets various fields in currently visible new Shot Form</caption>
 * // Description
 * cy.set_field_in_NwEnttyDlg('description', 'Closeup');
 * // Shot Type
 * cy.set_field_in_NwEnttyDlg('sg_shot_type', 'Regular');
 * // Status
 * cy.set_field_in_NwEnttyDlg('sg_status_list', 'ip');
 * // Cut In
 * cy.set_field_in_NwEnttyDlg('sg_cut_in', '5599');
 * // Task Template
 * cy.set_field_in_NwEnttyDlg('task_template', 'Animation - Shot');
 *
 */

export function set_field_in_NwEnttyDlg(field, value) {
    // Be flexible with your new entity form selector because of variants
    // This will not work with new Project form
    cy.get('.sg_new_entity_form, [sg_id*="Dlg:CllMngr"]').should('be.visible').within(dlg => {
        // Click into the field, passing in force:true to mitigate any invisible elements that might block cypress interaction
        cy.get(`.sg_cell_content[sg_selector="input:${field}"]`).click({ force: true });
        // Ensure there is an active editor before proceeding with typed commands
        cy.window().its('SG.globals.active_editor').should('exist');
        // Type into the input, but be flexible with your input type
        cy.get('div.entity_editor:last textarea,div.entity_editor:last input').should('exist').type(value);
        // Stow the editor
        cy.window().its('SG.globals.active_editor').invoke('blur');
    });
}
