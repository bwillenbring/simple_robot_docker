// api (rest)
import * as api from './api';
Cypress.Commands.add('get_access_token', api.get_access_token);

// login functionality
import * as login from './login';
Cypress.Commands.add('login_admin', login.login_admin);

// page and navigation functionality
import * as page from './page'
Cypress.Commands.add('home', page.home);
Cypress.Commands.add('navigate_to_page', page.navigate_to_page);
Cypress.Commands.add('navigate_to_project_page', page.navigate_to_project_page);
Cypress.Commands.add('wait_for_page_to_load', page.wait_for_page_to_load);
Cypress.Commands.add('wait_for_spinner', page.wait_for_spinner);
Cypress.Commands.add('global_nav', page.global_nav);

// utils
import * as utils from './utils'
// Cypress.Commands.add('log', utils.log);

// Query Field functionality
import * as query_fields from './query_fields';
Cypress.Commands.add('create_query_field', query_fields.create_query_field);
Cypress.Commands.add('get_field_by_display_name', query_fields.get_field_by_display_name);
Cypress.Commands.add('verify_field_exists', query_fields.verify_field_exists);

// New entity form functionality
import * as new_entity_forms from './new_entity_forms';
Cypress.Commands.add('set_field_in_NwEnttyDlg', new_entity_forms.set_field_in_NwEnttyDlg);

// i18next functionality
import * as i18n from './i18n';
Cypress.Commands.add('get_translation', i18n.get_translation);

// Paste functionality (for importer)
import { paste } from './clipboard';
Cypress.Commands.add(
    'paste',
    {
        prevSubject: true,
    },
    paste
);
