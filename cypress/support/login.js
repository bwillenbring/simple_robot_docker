/**
 * @function login_admin
 * @description Logs in to the web app by posting a request to `/user/login`, and resets `Cypress.config('admin_id')`` based on the cookie value returned by Shotgun.
 *
 * By default, it will persist the session so that subsequent calls to login are not needed in between test cases. This command is preferable to {@link login_as cy.login_as('admin')} in almost all cases, and should be used instead.
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {Boolean} persist=true - Whether or not to persist the session in this manner...
 * ```
 * Cypress.Cookies.defaults({
 *    whitelist: ['_session_id', `csrf_token_u${Cypress.config('admin_id')}`],
 * });
 * ```
 *
 * @example
 * describe('Test Suite', function() {
 *     before(function() {
 *         // Login as admin and also persist your session (default behavior)
 *         cy.login_admin();
 *     });
 *
 *     // Now, there is no need to login over and over betweent test cases
 *
 *     it('Visit home page', function() {
 *         cy.home();
 *     });
 *
 *     it('Visit Shots Page', function() {
 *         cy.navigate_to_project_page('Shot');
 *     })
 *
 *     it('Set page to list mode', function() {
 *         cy.set_page_mode('list');
 *     })
 *
 *     it('Run a quick filter on boo', function() {
 *         cy.run_quick_filter('boo');
 *     })
 *
 *     it('Clear the quick filter', function() {
 *         cy.clear_quick_filter();
 *     })
 * });
 *
 * @example
 * // Do this if you DON'T want your session cookies persisted
 * cy.login_admin(false);
 *
 */
 export function login_admin(persist=true) {
     cy
         .request({
             method: 'POST',
             url: '/user/login',
             form: true,
             followRedirect: true, // turn on/off following redirects
             body: {
                 'user[login]': Cypress.config('admin_login'),
                 'user[password]': Cypress.config('admin_pwd'),
                 ignore_browser_check: 1,
             },
         })
         .then(resp => {
             // There are 2 important cookies to retrieve
             // 1. csrf_token_u{number}
             // 2. _session_id
             cy.getCookies().then(cookies => {
                 // Locate the cookie whose name starts with csrf_token_u
                 for (const idx in cookies) {
                     if (cookies[idx].name.startsWith('csrf_token_u')) {
                         // let csrf_name = 'csrf_token_u' + Cypress.config('admin_id');
                         let csrf_name = cookies[idx].name;
                         // Derive the user's id from the cookie name (rather than blindly trusting cypress.json config)
                         let id = Number(csrf_name.replace('csrf_token_u', ''));
                         // Reset the Cypress.config('admin_id') to the real value as determined by the login - not the config
                         Cypress.config('admin_id', id);
                         cy.log('Admin id==' + id);
                         Cypress.config(csrf_name, cookies[idx].value);
                         return;
                     }
                 }
                 throw new Error('Could not find a csrf token value!');
             });
             // Set _session_id
             cy.getCookie('_session_id').then(cookie => {
                 Cypress.config('_session_id', cookie.value);
             });
         })
         .then(() => {
             if (persist == true) {
                 // Persist the session-related cookies so that a login is not required in between test cases
                 Cypress.Cookies.defaults({
                     whitelist: ['_session_id', `csrf_token_u${Cypress.config('admin_id')}`],
                 });
             }
         });
 }
