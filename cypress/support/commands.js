// api (rest)
import * as api from './api';
Cypress.Commands.add('get_access_token', api.get_access_token);
Cypress.Commands.add('get_rest_endpoint', api.get_rest_endpoint);

Cypress.Commands.add('get_field', api.get_field);
Cypress.Commands.add('field_exists', api.field_exists);
Cypress.Commands.add('run_python_script', api.run_python_script);

// CRUD
import * as crud from './crud';
Cypress.Commands.add('create_entity', crud.create_entity);
Cypress.Commands.add('edit_entity', crud.edit_entity);
Cypress.Commands.add('get_entity', crud.get_entity);
Cypress.Commands.add('delete_entity', crud.delete_entity);
Cypress.Commands.add('revive_entity', crud.revive_entity);
Cypress.Commands.add('search_entities', crud.search_entities);
Cypress.Commands.add('get_schema', crud.get_schema);
Cypress.Commands.add('batch_request', crud.batch_request);
Cypress.Commands.add('conditionally_create', crud.conditionally_create);

// login functionality
import * as login from './login';
Cypress.Commands.add('login_admin', login.login_admin);

// Schema functionality
import * as schema from './schema';
Cypress.Commands.add('get_access_token', api.get_access_token);



// page and navigation functionality
import * as page from './page'
Cypress.Commands.add('home', page.home);
Cypress.Commands.add('navigate_to_page', page.navigate_to_page);
Cypress.Commands.add('navigate_to_project_page', page.navigate_to_project_page);
Cypress.Commands.add('wait_for_page_to_load', page.wait_for_page_to_load);
Cypress.Commands.add('wait_for_spinner', page.wait_for_spinner);
Cypress.Commands.add('global_nav', page.global_nav);
Cypress.Commands.add('display_fields_in_grid', page.display_fields_in_grid);

// utils
import * as utils from './utils'


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
