import { readFileSync } from 'fs';
import { paste } from './clipboard';

// Query Field functionality
import * as query_fields from './query_fields';

// New entity form functionality
import * as new_entity_forms from './new_entity_forms';

// i18next functionality
import * as i18n from './i18n';

/**
 * function log
 * @description Overwrites the builtin `cy.log(message)` function, and sends `message`
 * to the terminal window that spawned the cypress process. It does this by calling a
 * custom task defined in `plugins/index.js`. Logging will continue to show up in the test runner.
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param message - Number, String, Bool, Array, or Object to print.
 *
 * @returns true
 *
 * @example
 * // Print a string to the terminal
 * cy.log('Some String');
 *
 * // Print a JSON Object
 * cy.fixture('/query_fields/single_record_thumbnail.json').then(config => {
 *     cy.log(config);
 * })
 *
 */
Cypress.Commands.overwrite('log', (originalFn, message, options) => {
    cy.task('append_log', message).then(() => {
        return originalFn(message, options);
    });
});

/**
 * @function setup_suite
 * @description Does Test suite setup, and is commonly used in the REST api cypress test specs. Handles the following: <ul>
 * <li>Sets `Cypress.config('admin_id') if it is incorrectly set, or not set</li>
 * <li>Creates a test project named `Cypress Test Project [${Cypress.moment()}]`</li>
 * <li>Sets the admin user's home page to the Test Project's overview page</li>
 * <li>**Test setup DOES NOT login to the web app**</li>
 * </ul>
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @example
 * // Usually done in a top-level before block
 * before(function() {
 *    cy.setup_suite();
 * });
 *
 */

Cypress.Commands.add('setup_suite', () => {
    // Set your admin_id global config
    let page_id;
    let filters = [['login', 'is', Cypress.config('admin_login')]];
    let fields = ['id', 'email', 'name'];
    cy.search_entities('HumanUser', filters, fields).then($resp => {
        //Set the admin_id value in cypress.config
        Cypress.config('admin_id', $resp.data[0].id);
    });

    // Enter default values for cookies
    let csrf_name = 'csrf_token_u' + Cypress.config('admin_id');

    // ALWAYS Create a TEST PROJECT - don't do this conditionally
    let project_name = 'Cypress Test Project [' + Cypress.moment() + ']';
    let data = {
        name: project_name,
        sg_description: 'Cypress',
    };
    // Create and set the TEST_PROJECT using the REST API
    cy.create_entity('Project', data).then($project_id => {
        cy.log('Setting newly created project id to: ' + $project_id);
        Cypress.config('TEST_PROJECT', {
            name: project_name,
            id: $project_id,
        });
        // Ensure the Home page of the admin is set to
        filters = [
            ['page_type', 'is', 'project_overview'],
            [
                'project',
                'is',
                {
                    type: 'Project',
                    id: $project_id,
                },
            ],
        ];
        // Get the project overview page id of the test project
        cy.search_entities('Page', filters, ['id']).then($results => {
            page_id = $results.data[0].id;
            // Set the Admin User's home page as the proj. overview page
            data = {
                custom_home_page: {
                    type: 'Page',
                    id: page_id,
                },
            };
            cy.edit_entity('HumanUser', Cypress.config('admin_id'), data).then($resp => {
                cy.log('Just set home page to proj. overivew OF TEST proj ' + Cypress.config('TEST_PROJECT').id);
            });
        });
    });
});

Cypress.Commands.add('validate_schema', entity_type => {
    assert.isTrue(Cypress.config('SCHEMA').includes(entity_type), 'Schema includes ' + entity_type);
});

/**
 * @function setup_tests_rest
 * @description Does rquired setup for all REST api test specs to run. Very important
 * ```
 * Cypress.Commands.add('setup_tests_rest', () => {
 *    //Obtain a rest token
 *    cy.get_access_token().then(() => {
 *        // This is essential - removing this will cause 100's of the basic rest api tests to fail
 *        cy.get_schema();
 *    })
 * });
 * ```
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 * @description Gets an API access token, then fetches the Shotgun schema for the current site under test. The schema entities returned are stored in `Cypress.config('ENTITIES')`, and this config variable is extensively used in REST api test specs.
 *
 * @returns {Object} All schema entities of the current Shotgun site.
 *
 * @example
 * describe('REST API test suite', function() {
 *     // This before listener runs ONCE before ALL tests in this 'describe' block
 *     before(function() {
 *         // Run the setups
 *         cy.setup_tests_rest();
 *     });
 *
 *     // Now your test cases have all they need
 *     it('GET /api/v1', function() {
 *         cy.get_rest_endpoint('/api/v1', 'GET').then($resp => {
 *             assert.isTrue($resp.status == 200, 'Status code of the request is 200');
 *         });
 *     });
 * });
 */
Cypress.Commands.add('setup_tests_rest', () => {
    //Obtain a rest token
    cy.get_access_token().then(() => {
        // This is essential - removing this will cause 100's of the basic rest api tests to fail
        cy.get_schema();
    });
});

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
Cypress.Commands.add('get_access_token', () => {
    let data = {
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
});

/**
 * @function get_rest_endpoint
 * @description Makes a call to a REST api endpoint, using the passed-in params. Always returns the REST api response object.
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} url - The endpoint: eg: `/api/v1/entity/Note/55`.
 *
 * @param {String} method=GET - The method: `GET`, `POST`, `UPDATE`, `DELETE`.
 *
 * @param {Boolean} failOnStatusCode=true - Whether the call should fail on a non 200'ish status code. Sometimes, you will want to set this to `false` when you are testing error messages that are sent with non-200 codes.
 *
 * @param {Object} data={} - The payload of form vars to send along. This is commonly included in `POST` requests with entity-create or entity-search endpoints.
 *
 * @param {String} content_type=application/json - The content_type of the request.
 *
 * @param {String} response_content_type=application/json - This param is optional.  The only other allowed value is `application/xml`.
 *
 * @returns {Object}
 *
 * @example <caption>Get a note's followers</caption>
 * cy.get_rest_endpoint('/api/v1/entity/Note/55/followers', 'GET').then(resp => {
 *    //Expect json
 *    expect($resp.headers['content-type']).to.contains('application/json');
 *    //status == 200
 *    assert.isTrue(resp.status == 200, 'Status code of the request is 200');
 * });
 *
 * @example <caption>Requesting xml by setting response_content_type</caption>
 * let data, failOnStatusCode, content_type, response_content_type;
  * cy
  *     .get_rest_endpoint(
  *         '/api/v1/entity/projects',
  *         'GET',
  *         (failOnStatusCode = true),
  *         (data = {}),
  *         (content_type = 'application/json'),
  *         (response_content_type = 'application/xml')
  *     )
  *     .then(resp => {
  *         //Expect xml because that is what you asked for
  *         expect(resp.headers['content-type']).to.contains('application/xml');
  *         //status == 200
  *         assert.isTrue(resp.status == 200, 'Status code of the request is 200');
  *     });
 *
 */
Cypress.Commands.add(
    'get_rest_endpoint',
    (
        url,
        method,
        failOnStatusCode = true,
        data = {},
        content_type = 'application/json',
        response_content_type = '',
        log_command = true,
        custom_request_headers = {}
    ) => {
        // This method accepts an url and method, and returns the REST response
        var request_headers = {
            ...{
                Authorization: 'Bearer ' + Cypress.config('TOKEN').body.access_token,
                'content-type': content_type,
            },
            ...custom_request_headers,
        };

        if (response_content_type != '') {
            request_headers.accept = response_content_type;
        }
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
);




Cypress.Commands.add('wait_for_page_to_load', () => {
    cy.document().then(doc => {
        //doc.readystate should be 'complete'
        cy.wrap(doc.readyState).should('be.equal', 'complete');
        //spinner should not be showing
        cy.get('[data-cy="overlay-spinner"]').should('not.be.visible');
        // assert.isTrue(typeof(SG) != undefined, "SG exists!")
    });
});

Cypress.Commands.add(
    'sg_api_do',
    (command, entity_type = 'Asset', data = {}, filters = [], fields = [], follow = null, id = 0) => {
        let command_string = 'e = ' + command + '("' + entity_type + '", '; //eg: sg.create("Asset",
        switch (command) {
            case 'sg.create':
                command_string = "e = sg.create('" + entity_type + "', " + JSON.stringify(data) + ')';

                // Does user want to also follow?
                if (follow == true) {
                    // Pipe the created obj into an sg.follow() call and print True or False
                    command_string +=
                        '\n' +
                        "h = {'type':'HumanUser','id':" +
                        Cypress.config('admin_id') +
                        '}\n' +
                        'f = sg.follow(h, e)\n' +
                        "print f.get('followed', False)";
                } else {
                    // Else, just create the entity, and print the id
                    command_string += '\n' + "pprint(e['id'])";
                }
                break;
            case 'sg.update':
                command_string += id + ', ' + JSON.stringify(data) + ')';
                command_string += '\npprint(e)';
                break;
            case 'sg.find':
                command_string += 'filters=' + JSON.stringify(filters) + ', ';
                command_string += 'fields=' + JSON.stringify(fields) + ')';
                command_string += "\npprint(e[0]['id'])";
                break;
            case 'sg.schema_read':
                command_string = 'e = sorted(sg.schema_read().keys())\npprint(e)';
                break;
            default:
                //do nothing
                cy.log("Assume the user knows what she's doing");
                command_string = command;
                break;
        }
        //Now you have the command_string, write it into a python file and execute it
        cy.fixture('python/python_script_starter.txt').then(final_command => {
            final_command = final_command
                .replace('{baseUrl}', Cypress.config('baseUrl'))
                .replace('{admin_login}', Cypress.config('admin_login'))
                .replace('{admin_pwd}', Cypress.config('admin_pwd'))
                .replace('{command_string}', command_string);
            // let final_command = "wow"
            cy.writeFile('temp/ShotgunCypress.py', final_command).then(() => {
                //execute the python
                cy.exec('python temp/ShotgunCypress.py');
            });
        });
    }
);

Cypress.Commands.add('run_python_script', (script, args) => {
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
});


Cypress.Commands.add(
    'paste',
    {
        prevSubject: true,
    },
    paste
);

Cypress.Commands.add('switch_theme', () => {
    cy.get('[sg_selector="theme_switch_button"] ').click();
});

Cypress.Commands.add('create_query_field', query_fields.create_query_field);
Cypress.Commands.add('get_field_by_display_name', query_fields.get_field_by_display_name);
Cypress.Commands.add('verify_field_exists', query_fields.verify_field_exists);
Cypress.Commands.add('set_field_in_NwEnttyDlg', new_entity_forms.set_field_in_NwEnttyDlg);
Cypress.Commands.add('get_translation', i18n.get_translation);
