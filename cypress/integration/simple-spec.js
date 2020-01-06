describe('Sample Spec', function() {

    it('gets a rest api token', function() {
        cy.get_access_token().then(TK => {
            cy.log(Object.keys(TK));
            console.log(JSON.stringify(TK.body, undefined, 2));
            assert.isTrue(TK.status===200);
            assert.isTrue(TK.body.token_type==='Bearer');
            assert.isTrue(TK.body.expires_in >= 1);
        })
    });

    it('logs in as admin', function() {
        cy.login_admin();
    })

    it('goes to configured home page', function() {
        cy.home();
        cy.url().should('contain', Cypress.config('baseUrl'));
    })

    it('navigate to page 882', function() {
        cy.navigate_to_page('882'); // page should be a string like '/page/account_settings'
    })

    it('navigate to Project Page Asset', function() {
        cy.navigate_to_project_page('Asset'); // page should be a string like '/page/account_settings'
    })

    it('navigates to page xyz and gets Page not Found', function() {
        cy.navigate_to_page('/page/xyz'); // page should be a string like '/page/account_settings'
        cy.get('body').should('contain', "Sorry, we can't find this page")
    })
})
