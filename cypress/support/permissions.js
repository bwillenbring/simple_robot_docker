
/*
cy.reset_permission_group(permission_group)
- `permission_group`
  - Allowed values: ['artist', 'manager', 'admin']
  - Default: 'artist'
- Simulates a user clicking the 'Reset to Default' button from admin permissions page
- Returns: response object from POST request to /page/reset_permission_group
- Must have csrf token for this to work
*/
export function reset_permission_group(permission_group = 'artist') {
    let url = '/page/reset_permission_group';
    let allowed_groups = ['manager', 'admin', 'artist'];
    if (!allowed_groups.includes(permission_group)) {
        return false;
    } else {
        // you're ok to reset
        cy.get_csrf_token_value().then(token => {
            cy.log(token);
            let default_group = permission_group + '_system_default';
            let data = {
                reset_permission_group_code: permission_group,
                copy_permission_group_code: default_group,
                csrf_token: token,
            };
            // Make the request
            cy
                .request({
                    url: url,
                    method: 'POST',
                    form: true,
                    body: data,
                    failOnStatusCode: false,
                })
                .then(resp => {
                    console.log(resp);
                });
        });
    }
}


export function duplicate_permission_role({
    role_id: 8,
    new_role_name: `New Role ${String(Cypress.moment())}`
}) {
    const url = `/page/new_permission_group`
    const method = 'POST';
    cy.get_csrf_token_value().then(csrf_token => {
        const data = {
            set_id: 8,
            new_name: 'Cypress Perm',
            csrf_token: csrf_token
        }
        // Make the request
        cy
            .request({
                url: url,
                method: 'POST',
                form: true,
                body: data,
                failOnStatusCode: false,
            })
            .then(resp => {
                assert.isTrue(resp.status === 200);
                console.log(resp);
            });
    })
}


/*
cy.configure_permissions(permission_changes)
- `permission_changes`
  - Type: Array
  - Example:
    [{
        permission_rule_set_code: 'manager',
        rule_type: 'see_client_notes',
         allow: true
     }]
*/
export function configure_permissions_group(permission_changes = []) {
    cy.log('Trying to set permissions');
    let csrf = 'csrf_token_u' + Cypress.config('admin_id');
    cy.log('----------------------------------------');
    cy.log('Setting Permissions');
    cy.log('----------------------------------------');
    let url = 'page/set_permissions';

    //csrf_token: Cypress.config(csrf),
    let data = {
        permission_changes: permission_changes,
        csrf_token: Cypress.config(csrf),
    };
    // Stringify it...
    data.permission_changes = JSON.stringify(data.permission_changes);
    // Send the request
    cy
        .request({
            url: url,
            method: 'POST',
            form: true,
            body: data,
            failOnStatusCode: false,
        })
        .then($resp => {
            console.log($resp);
        });
}
