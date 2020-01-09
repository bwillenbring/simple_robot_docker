/* ----------------------------------------------------------------------
Preferences
---------------------------------------------------------------------- */
/**
 * @function get_prefs_page_id
 * @description Returns the id of the Site Preferences page by calling this REST api endpoint: `/api/v1/entity/pages?fields=name,page_type&sort=name&filter[page_type]=site_prefs`.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @returns {Number}
 *
 * @example
 * // Navigate to the hidden prefs page without knowing the ID in advance
 * cy.get_prefs_page_id().then(id => {
 *     cy.navigate_to_page(`/page/${id}?hidden_prefs_visible`);
 * })
 *
 */
Cypress.Commands.add('get_prefs_page_id', function() {
    let url = '/api/v1/entity/pages?fields=name,page_type&sort=name&filter[page_type]=site_prefs';
    cy.get_rest_endpoint(url, 'GET').then($resp => {
        let id = $resp.body.data[0].id;
        return id;
    });
});


/**
 * @function get_preference
 * @description Gets 1 or more preferences by `pref_key`, and returns the result. Does this by making a GET request to `preferences/get_prefs?_dc=`. This command is aliased by `cy.get_preferences` (plural).
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {Array|String} pref_list - 1 or more prefs by pref_key. See below for examples.
 *
 * @returns {Object}
 *
 * @example <caption>Get 1 preference at a time</caption>
 * // Get s3_primary_bucket
 * cy.get_preference('s3_primary_bucket').then(pref => {
 *    // Now you have an object
 *    assert.isTrue(pref.s3_primary_bucket !== '', 'Pref value is not empty string');
 * });
 *
 * // Get enable_new_exporter
 * cy.get_preference('enable_new_exporter').then(pref => {
 *    expect(pref.enable_new_exporter).to.be.oneOf(['yes', true])
 * });
 *
 * @example <caption> 2 or more Prefs</caption>
 * // Get a list of prefs
 * cy.get_preference(['s3_primary_bucket', 'enable_new_exporter']).then(pref => {
 *    console.log(JSON.stringify(pref, undefined, 2));
 * });
 *
 * // logs this...
 * {
 *    "enable_new_exporter": "yes",
 *    "s3_primary_bucket": "U.S.: Oregon (local)"
 * }
 *
 */
Cypress.Commands.add('get_preference', function(pref_list = []) {
    cy.request('preferences/get_prefs?_dc=' + Cypress.moment()).then($resp => {
        let all_prefs = $resp.body.prefs;
        let new_prefs = {};
        Cypress._.filter(all_prefs, function(obj, key) {
            // console.log(key);
            if (pref_list.includes(key)) {
                new_prefs[key] = obj.value;
                return obj;
            }
        });
        return new_prefs;
    });
});

/**
 * @function get_preferences
 * @description - An alias for {@link get_preference cy.get_preference()}.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 */
Cypress.Commands.add('get_preferences', cy.get_preference);

/**
 * @function set_preference
 * @description Sets 1 or more preferences by `pref_key`, then reloads the schema - all with xhr requests. This command is aliased by `cy.set_preferences` (plural).
 * <ul>
 * <li>No UI is required, but {@link login_as the user must be logged in}</li>
 * <li>If invalid `pref_keys` are passed in, this command will not fail, but obviously, non-existent prefs will not be set</li>
 * <li>Returns the response object of the request made to `page/reload_schema?_dc=`</li>
 * </ul>
 *
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {Object} values - A JSON object of key value pairs, using the `pref_key` names as keys.
 *
 * @returns {Object}
 *
 * @example <caption>Set 1 pref</caption>
 * // Turn on the enable_new_exporter feature
 * cy.set_preference({enable_new_exporter: 'yes'});
 *
 * @example <caption>Set multiple prefs</caption>
 * // Enable Chinese, and set it as the language
 * cy.set_preference({
 *    enable_zh_hans_translation: 'yes',
 *    language: 'zh-hans',
 * });
 */
Cypress.Commands.add('set_preference', function(values = {}) {
    if (typeof values !== 'object' || values == {}) {
        console.log('RETURN FALSE');
        return false;
    } else {
        // Go ahead and update the prefs
        let csrf = 'csrf_token_u' + Cypress.config('admin_id');
        let a = Cypress.moment();
        let url = 'preferences/update_prefs';
        let key;
        // Put the values into the data object
        let data = values;
        data['pref_type'] = 'site';
        (data['csrf_token'] = Cypress.config(csrf)), cy
            .request({
                method: 'POST',
                url: url,
                form: true,
                body: data,
            })
            .then($r1 => {
                // Now do the follow up requests to reload the schema
                let b = Cypress.moment();
                console.log(b - a);
                // return $r1; // At this point, execution time is 93ms
                // Everything after this point may only be necessary in the UI, but let's do it to be safe
                let m = Cypress.moment();
                cy.request('preferences/get_prefs?_dc=' + m, 'GET').then($keys => {
                    // console.log(JSON.stringify($keys.body.prefs[key], undefined, 2));
                    cy.request('page/reload_schema?_dc=' + m, 'GET').then($resp => {
                        let c = Cypress.moment();
                        console.log('Time taken to set prefs: ' + String(c - a));
                        return $resp;
                    });
                });
            });
    }
});

/**
 * @function set_preferences
 * @description - An alias for {@link set_preference cy.set_preference()}.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 */
Cypress.Commands.add('set_preferences', cy.set_preference);

/**
 * Set preference only if needed.
 * Minimal operations.
 */
Cypress.Commands.add('update_preference', ({ name, value, type = 'site' }) => {
    // Logged in check
    let config = Cypress.config();
    let csrfToken = config[`csrf_token_u${config.admin_id}`];
    if (!csrfToken) {
        throw new Error('[update_preference] Must be logged in before invoking');
    }
    if (!name) {
        throw new Error('[update_preference] Must be provided a name');
    }
    if (!value) {
        throw new Error('[update_preference] Must be provided a value');
    }

    cy.request('GET', '/preferences/get_prefs').then(response => {
        let pref = response.body.prefs[name];
        if (!pref) {
            throw new Error(`[update_preference] Preference ${name} does not exist`);
        }

        let currentValue = pref.value || pref.default_value;
        if (currentValue === value) {
            return;
        }

        cy
            .request({
                method: 'POST',
                url: '/preferences/update_prefs',
                form: true,
                body: {
                    [name]: value,
                    pref_type: type,
                    csrf_token: csrfToken,
                },
            })
            .then(() => {
                cy.log(`Preference ${type}::${name} set to ${value}`);
            });
    });
});

/**
 * @function disable_custom_entity
 * @description Disables a custom entity by making a call to `cy.set_preference()` and passing in a `pref_key` built from entity_type in the following way:
 * ```
 * let pref = 'use_' + SG.schema.entity_types[entity_type].name_pluralized_underscored;
 * cy.set_preference({pref: 'no'});
 * ```
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} entity_type - The CamelCase entity type of the entity to disable.
 *
 * @returns {Object}
 *
 * @example <caption>Simple</caption>
 * cy.disable_custom_entity('CustomEntity05');
 *
 */
Cypress.Commands.add('disable_custom_entity', function(entity_type) {
    cy.get_SG().then(SG => {
        const pref = `use_${SG.schema.entity_types[entity_type].name_pluralized_underscored}`;
        const values = {};
        values[pref] = 'no';
        cy.set_preference(values);
    });
});

// Expects a string containing the pref key header of the section
/**
 * @function expand_pref_section
 * @description Scrolls down to and expands a pref section, using the display name of the accordion (eg: `Feature Prefernces`). You must be logged in, and currently on the prefs page for this to work.
 * @author Ben Willenbring <benjamin.willenbring@autodesk.com>
 *
 * @param {String} section - The name that is displayed on the pref header accordion.
 *
 * @example
 * cy.expand_pref_section('Feature Preferences');
 *
 */
Cypress.Commands.add('expand_pref_section', function(section) {
    if (Cypress.$('div.opener[open_key="' + section + '"]').length > 0) {
        cy.get('div.opener[open_key="' + section + '"]').scrollIntoView().click();
    }
});
