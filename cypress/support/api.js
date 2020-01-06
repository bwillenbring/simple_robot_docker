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
