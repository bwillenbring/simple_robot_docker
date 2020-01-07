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


 /**
  * @function login_as(role='admin')
  *
  * @description Logs in to the web app by posting a request to `/user/login`. In most cases, one should use {@link login_admin cy.login_admin()}.
  * <ul>
  * <li>Regardless of passed-in value of `role`, this command <u>always uses the configured admin username and password</u></li>
  * <li>Will create a web session token that is distinct from the REST API token, and has different expiry characteristics</li>
  * </ul>
  *
  * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
  *
  * @param {String} role=admin - The role.
  *
  * @example
  * // Login as the admin
  * cy.login_as('admin');
  * // Then navigate somewhere
  * cy.navigate_to_project_page('Shot');
  *
  */
 Cypress.Commands.add('login_as', role => {
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
             //Go home
             let csrf_name = 'csrf_token_u' + Cypress.config('admin_id');
             cy.getCookies().then(cookies => {
                 for (const idx in cookies) {
                     if (cookies[idx].name.startsWith('csrf_token_u')) {
                         console.log('Cookie value of ' + csrf_name + '=' + cookies[idx].value);
                         Cypress.config(csrf_name, cookies[idx].value);
                         return;
                     }
                 }
                 throw new Error('Could not find a csrf token value!');
             });
             cy.getCookie('_session_id').then(cookie => {
                 // console.log('_session_id Cookie value of ' + cookie.value);
                 Cypress.config('_session_id', cookie.value);
             });
         });
 });

 Cypress.Commands.add('ui_login_as', role => {
     cy.visit('/user/login');
     switch (role) {
         case 'admin':
         default:
             cy.get('#user_login').type(Cypress.config('admin_login'));
             cy.get('#user_password').type(Cypress.config('admin_pwd'));
             break;
     }
     //Submit
     cy.get('form.sg_reset_form').submit().then(() => {
         //Get the schema
     });
     cy.url().should('not.contains', '/user/login', "You're no longer on the login page.");
 });

 // This ensures that your session and cookies are destroyed
 // It should be invoked prior to the running of each test case
 Cypress.Commands.add('logout', function() {
     cy.request('/user/logout').then($resp => {
         assert.isTrue($resp.status == 200, 'Logout good!');
     });
 });

 // dismiss the term of use
 Cypress.Commands.add('ToU_agreement', (user, password) => {
     // / Get the current url
     cy.url().then(resp => {
         if (resp.includes('terms_agreement')) {
             cy.wait_for('[for*="checkbox-input"]').click().then(() => {
                 cy.wait_for('[id="termsAgreementAcceptButton"]').click().then(() => {
                     cy.url().should('not.contains', '/terms_agreement');
                 });
             });
         }
     });
 });

 // dismiss the profile_data page
 Cypress.Commands.add('profile_data_page', (user, password) => {
     // / Get the current url
     cy.url().then(resp => {
         if (resp.includes('profile_data')) {
             cy.get('[id="profileDataRoleSelect"]').should('be.visible');
             cy.wait_for('[id=profileDataRoleDeclineButton]').click().then(() => {
                 cy.url().should('not.contains', '/profile_data');
             });
         }
     });
 });
