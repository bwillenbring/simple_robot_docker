describe('Sample Spec', function() {

    before(function() {
        cy.get_access_token();
        cy.login_admin();
    })

    describe('Navigation', function() {
        it('goes to configured home page', function() {
            cy.home();
            cy.url().should('contain', Cypress.config('baseUrl'));
        })

        it('navigates to page 882', function() {
            cy.navigate_to_page('882'); // page should be a string like '/page/account_settings'
        })

        it('navigates to Project Page Asset', function() {
            cy.navigate_to_project_page('Asset'); // page should be a string like '/page/account_settings'
        })

        it('navigates to page xyz and gets Page not Found', function() {
            cy.navigate_to_page('/page/xyz'); // page should be a string like '/page/account_settings'
            cy.get('body').should('contain', "Sorry, we can't find this page")
        })
    })

    describe('REST API and Schema', function() {
        it('cy.get_rest_endpoint /api/v1', function() {
            cy.get_rest_endpoint({ url:'/api/v1' }).then(resp => {
                const expected_attributes = [
                    'shotgun_version',
                    'shotgun_version_number',
                    'shotgun_build_number',
                    'portfolio_version',
                    'user_authentication_method'
                ]
                // Assertions
                expected_attributes.forEach(function(attribute) {
                    assert.isTrue(resp.body.data.hasOwnProperty(attribute));
                });
            })
        })

        it('create an asset', function() {
            const data = {
                code:'Test Asset',
                project: {type: 'Project', id: Cypress.config('TEST_PROJECT').id}
            }
            cy.create_entity('Asset', data).then(id => {
                cy.log(`Created asset with id ${id}`)
            })
        })

        it('get_field', function() {
            cy.get_field('Asset', 'code').then(resp => {
                console.log(resp.body.data);
                assert.isTrue(resp.body.data.name.value === 'Asset Name');
            })
        })
    })

    describe('Page Layout Handling', function() {
        before(function() {
            // Load the project shots page
            cy.navigate_to_project_page('Shot');
            cy.set_page_mode('list'); // eg: list, thumb, md, task
        });
        it('toggles page mode to list', function() {
            cy.set_page_mode('list'); // eg: list, thumb, md, task
        });

        it('Sets 4 display columns', function() {
            cy.display_fields_in_grid(['code','image', 'description', 'sg_status_list']);
        })

        it('moves description to place 2', function() {
            cy.move_column('description', 1);
        })

        it('refreshes the grid 2 times', function() {
            cy.refresh_grid();
            cy.refresh_grid();
        })

        it('runs a quick filter', function() {
            cy.run_quick_filter('foo bar is great!')
        })

        it('group shots by status', function() {
            cy.click_toolbar_item('Group');
            cy.handle_menu_item('Status')
        })

        it('ungroup a page', function() {
            cy.ungroup_page();
        })
    });

})
