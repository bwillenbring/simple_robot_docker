// cy.clear_thumbnail(entity_type, id)
// Sets the thumbnail of a specific entity to null by making a REST api request on the entity's `image` field. Returns the REST api response object. Dispatches a 1000 ms wait after the response is returned so that the UI can catch up to the server.
/**
 * @function clear_thumbnail
 * @description Sets the thumbnail for a particular entity (by type and id) to `null`.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} entity_type - The CamelCase entity type
 * @param {Number} id - The id of the entity.
 *
 * @returns {Object}}
 *
 * @example
 * // Clear out Asset 1167's thumbnail
 * cy.clear_thumbnail('Asset', 1167);
 *
 */
export function clear_thumbnail(entity_type, id) {
    // Just set the image field to null
    cy.edit_entity(entity_type, id, {
        image: null,
    });
}


export function get_rest_endpoint({
    url,
    method = 'GET',
    failOnStatusCode = true,
    data = { },
    content_type = 'application/json',
    response_content_type = '',
    log_command = true,
    custom_request_headers = { },
    request_headers = { Authorization: `Bearer ${Cypress.config('TOKEN').body.access_token}` }
    } = { }) {
        // Always set
        request_headers.content_type = content_type;
        request_headers.accept = (response_content_type !== '') ? response_content_type : null

        // Return a cy.request
        return cy
            .request({
                method: method,
                url: url,
                headers: request_headers,
                body: data,
                failOnStatusCode: failOnStatusCode,
                followRedirect: false,
                log: log_command,
            })
            .then(resp => {
                return resp;
            });
    }

/**
 * @function get_field
 * @returns {Object} REST api repsonse from a schema GET request.
 * @description Gets a field using a REST api endpoint call to `/api/1/schema/{entity_type}/fields/{system_field_name}`.
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} entity_type - The CamelCase entity type.
 * @param {String} system_field_name - The system name of the display column (eg: sg_status_list).
 *
 * @example
 * cy.get_field('Shot', 'sg_qa_number').then(resp => {
 *    assert.isTrue(resp.body.data.data_type.value !== 'text');
 * })
 *
 */
export function get_field(entity_type, system_field_name) {
    let endpoint = '/api/v1/schema/' + entity_type + '/fields/' + system_field_name;
    const params = {
        url: endpoint,
        method: 'GET',
        failOnStatusCode: false
    }
    cy.get_rest_endpoint(params).then($resp => {
        return $resp;
    });
}

/**
 * @function field_exists
 * @returns {Boolean}
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 * @description Returns whether or not a given field exists for a given entity type.
 * @param {String} entity_type - The CamelCase entity type.
 * @param {String} system_field_name - The system field name.
 *
 * @example
 * cy.field_exists('Task', 'sg_qa_currency').then(exists => {
 *    assert.isTrue(exists);
 * })
 *
 */
export function field_exists(entity_type, system_field_name) {
    let endpoint = '/api/v1/schema/' + entity_type + '/fields/' + system_field_name;
    cy.get_field(entity_type, system_field_name).then($resp => {
        return $resp.status == 200;
    });
}



/**
 * @function get_access_token
 * @description Gets a REST api auth token, using the configured admin login and password. Stores this token Object in `Cypress.config('TOKEN')`.
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @example
 * // Get a rest api token and examine its attributes...
 * cy.get_access_token().then(TOKEN => {
 *    let access_token = TOKEN.body.access_token;
 *    let expires_in = TOKEN.body.expires_in;
 *    let refresh_token = TOKEN.body.refresh_token;
 *    let token_type = TOKEN.body.token_type;
 *    // Remember, all of this ^^ is always available in Cypress.config('TOKEN');
 * })
 *
 */

export function get_access_token() {
    const data = {
        username: Cypress.config('admin_login'),
        password: Cypress.config('admin_pwd'),
        grant_type: 'password',
    };
    //Dispatch POST request to obtain the token
    cy
        .request({
            method: 'POST',
            url: '/api/v1/auth/access_token',
            form: true, //Automatically sets headers[content-type] to application/x-www-form-urlencoded
            body: data,
        })
        .then(resp => {
            // Set the TOKEN in the global config so that
            // Subsequent test cases can make use of this token
            Cypress.config('TOKEN', resp);
            return resp;
        });
}

export function run_python_script(script, args) {
    // Accepts 2 args:
    //  1) script - name of the python file located in /fixtures/python/
    //  2) args - string of args to pass to the python script
    // example: run_python_script('sample_python_hook.py', '--name Carl Bass')
    // It is assumed your python script will have an argparse code snippet to
    // handle whatever --arg(s) you pass in.
    // See sample_python_hook.py for an example of this.
    let default_args =
        '-baseUrl ' +
        Cypress.config('baseUrl') +
        ' ' +
        '-admin_login ' +
        Cypress.config('admin_login') +
        ' ' +
        '-admin_pwd ' +
        Cypress.config('admin_pwd');

    switch (args) {
        case undefined:
        case null:
        case '':
            args = default_args;
            break;
        default:
            //args is a non-empty string
            args = default_args + ' ' + args;
            break;
    }
    // Now execute the python, and grab the printed output
    let cmd_string = 'python fixtures/python/' + script + ' ' + args;
    cy.exec(cmd_string).then($resp => {
        //Trap and return the printed output in the .stdout
        return $resp.stdout;
    });
}



/**
 * @function set_task_thumbnail_render_mode
 * @description Configures the render mode of Task.image to one of 3 possible values:
 * <ol>
 * <li>manual</li>
 * <li>latest</li>
 * <li>query</li>
 * </ol>
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} config=manual - The render mode. Must be one of the allowed values.
 *
 * @returns Returns this...
 *
 * @example
 * // Configure for manual Uploads
 * cy.set_task_thumbnail_render_mode('manual');
 *
 * // Latest Version or Note
 * cy.set_task_thumbnail_render_mode('latest');
 *
 * // Query-based (uses the default query)
 * cy.set_task_thumbnail_render_mode('query');
 *
 */

export function set_task_thumbnail_render_mode(config='manual') {
    // Only allow either: manual, latest, or query
    if (! ['manual', 'latest', 'query'].includes(config)) { config = 'manual' }
    // Load the fixture data to make the request...
    cy.fixture(`task_render_modes/config_${config}.json`).then(config_json => {
        const data = {
            csrf_token: Cypress.config(`csrf_token_u${Cypress.config('admin_id')}`),
            dialog_params: JSON.stringify(config_json),
        };
        cy.request({
            url: '/background_job/configure_dc',
            method: 'POST',
            form: true,
            body: data,
            failOnStatusCode: false,
        })
    });
}


// cy.get_private_api_endpoint(url, {options})
// Sends a request to a private endpoint url, and sends back the response
Cypress.Commands.add('get_private_api_endpoint', function(
    url,
    options = {
        method: 'GET',
        failOnStatusCode: true,
        data: {},
        content_type: 'application/json',
        response_content_type: '',
    }
) {
    // This method accepts an url and method, and returns the REST response
    let request_headers = {
        Authorization: 'Bearer ' + Cypress.config('TOKEN').body.access_token,
        'content-type': options.response_content_type,
        'Shotgun-Private-Api': 'assignment',
    };

    if (options.response_content_type != '') {
        request_headers.accept = options.response_content_type;
    }
    // console.log("data passed in..." + data.toString())
    cy
        .request({
            method: options.method,
            url: url,
            headers: request_headers,
            body: options.data,
            failOnStatusCode: options.failOnStatusCode,
            followRedirect: false,
        })
        .then(resp => {
            return resp;
        });
});
