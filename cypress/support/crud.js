/* ------------------------------------------------------------------------------------------------------

CREATING, EDITING, FINDING, DELETING, AND REVIVING THINGS

------------------------------------------------------------------------------------------------------ */

// This method creates 1 entity using the REST API
// It returns an id if successful. Otherwise, it returns false
/**
 * @function create_entity
 * @description Creates a single entity using a POST request to the REST api endpoint, then returns the id of the created entity.
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} entity_type - The CamelCase entity type you'd like to create.
 * @param {Object} data - The payload of attribute/value pairs - exactly like the python api.
 *
 * @returns {Number}
 *
 * @example <caption>Simple</caption>
 * // Create a Shot named foo in the Test Project
 * cy.create_entity('Shot', {
 *    project: { type: 'Project', id: Cypress.config('TEST_PROJECT').id },
 *    code: 'foo'
 * }).then(id => {
 *    // Go ahead and navigate to the detail page
 *    cy.navigate_to_page(`/detail/Shot/${id}`);
 * });
 */
export function create_entity(entity_type, data = { }) {
    const params = {
        url: `/api/v1/entity/${entity_type}`,
        method: 'POST',
        failOnStatusCode: true,
        data: data
    }
    cy.get_rest_endpoint(params).then($resp => {
        // Either return the id on success (201) or false
        return ($resp.status == 201) ? $resp.body.data.id : false;
    });
}

/**
 * @function edit_entity
 * @description Edits an entity by issuing a `PUT` request to a REST api endpoint. Returns the status of the edit having succeeded.
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} entity_type - The CamelCase entity type.
 * @param {Number} id - The Id of the entity you'd like to edit.
 * @param {Object} data - The payload of attribute/value pairs - exactly like the python api.
 *
 * @returns {Boolean}
 *
 * @example
 * // From a page of Assets...
 * // Use the REST api to edit Asset 1140
 * cy.edit_entity('Asset', 1140, {sg_status_list: 'ip', description: 'Changing status'});
 *
 */
export function edit_entity(entity_type, id, data = { }) {
    const params = {
        url: `/api/v1/entity/${entity_type}/${id}`,
        method: 'PUT',
        data: data,
        failOnStatusCode: true
    }
    cy.get_rest_endpoint(params).then($resp => {
        return $resp.status == 200;
    });
}

// This method gets all passed-in fields on 1 entity.
// If no fields are passed in, all fields will be returned.
// It returns a hash of that entity, with its fields.

/**
 * @function get_entity
 * @description Gets 1 or more fields on the entity by issuing a `GET` request to a REST api endpoint. Accepts a querystring parameter of `?fields` to restrict the fields returned. Returns the response object of that request.
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} entity_type - The CamelCase entity type.
 * @param {Number} id - The id of the entity.
 * @param {Array} fields - **OPTIONAL** - a list of 1 or more fields to return, which is helpful for speeding up requests. If the flag isn't provided, all fields on the entity are returned.
 *
 * @returns {Object}
 *
 * @example
 * cy.get_entity('Asset', 1140, ['code', 'description', 'sg_status_list']).then(resp => {
 *    // Assert that the description is not an empty string
 *    assert.isTrue(resp.attributes.description !== '');
 * });
 *
 * @example
 * cy.get_entity('Version', 1140, ['image_source_entity']).then(resp => {
 *    // Assert that the image source entity id is a number
 *    expect(resp.relationships.image_source_entity.data.id).to.be.a('number');
 * });
 *
 * @example
 * // Get Attachment id=1000, and make assertions on its attributes
 * cy.get_entity('Attachment', 1000, fields).then(resp => {
 *    // Assert the attachment is actually linked to Note 40
 *    expect(resp.relationships.attachment_links.data[0]).to.deep.include({
 *        id: 40,
 *        type: 'Note',
 *    });
 *
 *    // Further assertions
 *    expect(resp.attributes.this_file.name).to.equal('test-cypress.jpg);
 *    expect(resp.attributes.this_file.content_type).to.equal('image/jpeg');
 *    expect(resp.attributes.this_file.link_type).to.equal('upload');
 *    expect(resp.relationships.image_source_entity.data.type).to.equal('Attachment');
 * });
 */
export function get_entity(entity_type, id, fields = '') {
    // Create a fields querystring var to hold the optional fields param
    let fields_qs;
    // Handle fields as either Array or String
    if (Array.isArray(fields)) {
        fields_qs = '?fields=' + fields.join();
    } else if (fields.length > 0) {
        fields_qs = '?fields=' + fields;
    } else {
        fields_qs = '';
    }
    // Form your params
    const params = {
        url: `/api/v1/entity/${entity_type}/${id}${fields_qs}`,
        method: 'GET',
        failOnStatusCode: false
    }
    cy.get_rest_endpoint(params).then($resp => {
        return $resp.body.data;
    });
}

// This method deletes 1 entity whose id==passed in value.
/**
 * @function delete_entity
 * @description Deletes (aka: retires) a single entity. Returns whether or not the delete succeeded - `true` or `false`.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} entity_type - The CamelCase entity type.
 * @param {Number} id - The id of the entity you'd like to delete.
 *
 * @returns {Object}
 *
 * @example
 * cy.delete_entity('Asset', 1140);
 *
 */
export function delete_entity(entity_type, id) {
    const params = {
        url: `/api/v1/entity/${entity_type}'/${id}?fields=id,code`,
        method: 'DELETE'
    }
    cy.get_rest_endpoint(params).then($resp => {
        return $resp.status == 204;
    });
}

// This method revives 1 entity whose id==passed in value.
/**
 * @function revive_entity
 * @description Revives (aka: undeletes) a single entity. Returns whether or not the operation succeeded - `true` or `false`.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} entity_type - The CamelCase entity type.
 * @param {Number} id - The id of the entity you'd like to delete.
 *
 * @returns {Object}
 *
 * @example
 * cy.revive_entity('Asset', 1140);
 *
 */
export function revive_entity(entity_type, id) {
    const params = {
        url: `/api/v1/entity/${entity_type}/${id}?revive=1`,
        method: 'POST'
    }
    cy.get_rest_endpoint(params).then($resp => {
        return $resp.body.meta.did_revive == true;
    });
}

export function search_entities({
    entity_type = '',
    filters = [],
    fields = ['id'],
    size,
    sort = '-id'
} = { }) {
    // const endpoint = `/api/v1/entity/${entity_type}/_search?sort=${sort}`
    const endpoint = `/api/v1/entity/Projects/_search?sort=${sort}`
    if (size > 0) { endpoint += '&page[size]=' + size }

    const params = {
        url: endpoint,
        method: 'POST',
        data: {
            filters: filters,
            fields: fields
        },
        content_type: 'application/vnd+shotgun.api3_array+json',
        failOnStatusCode: false
    }

    cy.get_rest_endpoint(params).then($resp => {
        console.log($resp.body)
        return $resp
    });
}

// FIX
export function batch_request({
    endpoint = '/api/v1/entity/_batch',
    failOnStatusCode = false,
    data = { }} = { }) {
    // Begin function
    cy.get_rest_endpoint(params).then($resp => {
        return ($resp.status !== 200) ? { errors: $resp.body.errors } : $resp
    });
}

export function get_schema() {
    cy.get_rest_endpoint({url: '/api/v1/schema'}).then($resp => {
        // SET THE CONFIG 'ENTITIES' KEY so that tests that rely
        // on entity type iteration can be dynamically skipped if necessary
        Cypress.config('ENTITIES', Object.keys($resp.body.data));
        return Object.keys($resp.body.data);
    });
}

/**
 * @function conditionally_create
 * @description Based on filter criteria passed in to the call, it will either...
 * <ol>
 * <li>Find an entitty that matches your filter(s) and return its id</li>
 * <li>Creates an entity with the attributes you've passed in, then return that id</li>
 * </ol>
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} entity_type - The CamelCase entity type.
 * @param {Object} data - The payload of attribute/value pairs - exactly like the python api. In addition, you must include a `filters` key. See below
 * @param {Array} data.filters - An array of 1 or more filter conditions that will be used to locate a potential entity match.
 *
 * @returns {Number}
 *
 * @example
 * // Assuming there is a shot named 'needle in a haystack' the create won't occur
 * // but the id of the matching shot will be returned
 * cy.conditionally_create('Shot', {
 *    project: { type: 'Project', id: Cypress.config('TEST_PROJECT').id },
 *    code: 'needle in a haystack',
 *    filters: [['code','is', 'needle in a haystack']]
 * }).then(id => {
 *    // Go to the Shot detail page
 *    cy.navigate_to_page(`/detail/Shot/${id}`);
 * });
 *
 */
export function conditionally_create({
    entity_type = '',
    data = { },
    filters = [['id', 'is', 0]],
    fields = ['id']
} = { }) {
    // Try to find a matching entity based on the passed in filter
    cy.search_entities({
        entity_type: entity_type,
        filters: filters,
        fields: fields
    }).then($resp => {

        // If search results are empty, then create the entity
        if (! $resp.hasOwnProperty('data') || $resp.data.length == 0) {
            cy.log('no entity found');
            // Before you create, remove the additional keys tha tmay exist in the data object
            if (Object.keys(data).includes('key')) { delete data.key }
            if (Object.keys(data).includes('filters')) { delete data.filters }

            // Create the entity
            return cy.create_entity(entity_type, data);
        } else {
            cy.log(`I found an entity ${entity_type} to match ${filters.toString()}`);
            let id = $resp.data[0].id;
            return id;
        }
    });
}
