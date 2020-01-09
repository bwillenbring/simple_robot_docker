

/**
 * @function reset_permission_group
 * @description Resets a given permission group (by name) to default
 * @author Ben Willenbring <bwillenbring@gmail.com>
 *
 *
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

/**
 * @function duplicate_permission_role
 * @description Duplicates a role (by Id)
 * @author Ben Willenbring <bwillenbring@gmail.com>
 *
 */
export function duplicate_permission_role({
    role_id = 8,
    new_role_name = `New Role ${String(Cypress.moment())}`
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


/**
 * @function configure_permissions_group
 * @description Configures a permission role, using a spec
 * @author Ben Willenbring <bwillenbring@gmail.com>
 *
 */
export function configure_permissions_group(permission_changes = []) {
    cy.get_csrf_token_value().then(csrf_token => {
        const url = 'page/set_permissions';
        // Form the body of your request
        const data = {
            permission_changes: permission_changes,
            csrf_token: csrf_token,
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
    })
}


export function delete_permission_group(role, role_id) {
    cy.get_csrf_token_value().then(csrf_token => {
        if (! role) {
            throw new Error('Permission role cannot be empty');
        }
        else {
            const params = {
                url: '/page/retire_permission_group',
                method: 'POST',
                set_id: role_id,
                retarget_set_id: -1,
                csrf_token: csrf_token
            }
        }
    })
}
