/* ----------------------------------------------------------------------
Field creation, deletion, delete forever
---------------------------------------------------------------------- *

/**
 * @function create_field
 *
 * @description Creates a field using the REST API. Returns the REST api response from the POST request used to create the field. Important to note: **this method cannot be used to create a query field**. See {@link create_query_field}.
 *
 * @returns {Object}
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} entity_type - The entity type.
 * @param {String} data_type - The data type of the field to create
 * @param {Array} properties - A list of key/value pairs
 *
 * @example <caption>Calculated Field</caption>
 * // Create a calculated field via the REST api
 * let entity_type = 'Task';
 * let data_type = 'calculated';
 * let properties = [
 *     {
 *         property_name: 'name',
 *         value: 'Cypress Calculated field',
 *     },
 *     {
 *         property_name: 'calculated_function',
 *         value: 'CONCAT("Cypress ✔★♛ - id ^2=", {id}*{id}*{id}*{id})',
 *     },
 * ];
 * cy.create_field(entity_type, data_type, properties).then($resp => {
 *     console.log(JSON.stringify($resp, undefined, 2));
 * });
 */

Cypress.Commands.add('create_field', function(entity_type, data_type, properties = []) {
    // This will create a field of type...
    const allowed_types = [
        'calculated',
        'checkbox',
        'currency',
        'date',
        'date_time',
        'duration',
        'url',
        'float',
        'footage',
        'list',
        'number',
        'percent',
        'text',
    ];
    if (!allowed_types.includes(data_type)) {
        return {
            success: false,
            reason: data_type + ' not in allowed types',
        };
    } else {

        const params = {
            url: `/api/v1/schema/${entity_type}/fields`,
            method: 'POST',
            failOnStatusCode: true,
            data: {
                data_type: data_type,
                properties: properties,
            }
        }
        cy.get_rest_endpoint(params).then($resp => {
            // Extract the system name
            let r = new RegExp('/api/v1/schema/' + entity_type + '/fields/', 'i');
            let self = $resp.body.links.self;
            let system_name = self.replace(r, '');
            console.log('system_name', system_name);
            return $resp;
        });
    }
});

//
// returns the REST API response

/**
 * @function delete_field
 * @description Deletes a field (not permanently). Returns the REST api response from the `DELETE` call.
 * @returns {Object}
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} entity_type - The CamelCase entity type.
 * @param {String} system_field_name - The system field name.
 * @param {Boolean} delete_forever=false - Whether or not to additionally call `cy.delete_field_forever()`.
 *
 *
 * @example
 * cy.delete_field('Task','sg_qa_currency');
 *
 */
Cypress.Commands.add('delete_field', function(entity_type, system_field_name, delete_forever = false) {
    let endpoint = '/api/v1/schema/' + entity_type + '/fields/' + system_field_name;

    // First, find out if the field exists
    cy.field_exists(entity_type, system_field_name).then(exists => {
        if (exists == true) {
            // Go ahead and delete the field...
            cy
                .get_rest_endpoint({ url: endpoint, method: 'DELETE', failOnStatusCode: true })
                .then($resp => {
                    // You should get a 204 response from this operation
                    // If delete_forever == true, delete it forever
                    if (delete_forever == true) {
                        cy.delete_field_forever(entity_type + '.' + system_field_name);
                    }
                });
        } else {
            // If delete_forever == true, delete it forever
            if (delete_forever == true) {
                cy.delete_field_forever(entity_type + '.' + system_field_name);
            }
        }
    });
});

/* cy.delete_field_forever()
  Deletes a field forever - optionally forever if an addtional arg == true.
  Expects a string of field names like: '["Shot.sg_single_rec_1538939714464"]'
*/
Cypress.Commands.add('delete_field_forever', function(field_names) {
    let url = '/background_job/delete_columns_forever';
    let csrf = 'csrf_token_u' + Cypress.config('admin_id');
    let data = {
        fields: field_names,
        csrf_token: Cypress.config(csrf),
    };
    // Send the request
    cy.request({
        url: url,
        method: 'POST',
        form: true,
        body: data,
        failOnStatusCode: false,
    });
});
