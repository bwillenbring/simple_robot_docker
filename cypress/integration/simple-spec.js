/// <reference types="cypress" />
describe('Home Page Check', function () {
    it('checks home page for doodler', function () {
        cy.visit('')
        // assert that the body contains the text pattern you
        cy.get('body').contains(/doodler/i)
        // inline the video recording of the spec in the mochawesome-report
        cy.addTestContext('Video', `./videos/${Cypress.spec.name}.mp4`)
    })
})
