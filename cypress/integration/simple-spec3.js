/// <reference types="cypress" />
describe('AI Story Generator', function () {
    it('generates an ai story', function () {
        cy.visit('/willenblog/animatronic-ai-story-generator')
        // assert the story container text is empty
        cy.get('#story_container')
            .invoke('text')
            .invoke('trim')
            .should('eq', '')
        // click the get story button
        cy.get('a[data-initialized]:contains("Get Story")').click()
        // ensure the story contains 100 characters or more of text
        cy.waitUntil(() =>
            cy
                .get('#story_container')
                .then((story) => Cypress.$(story).text().length > 100)
        ).then(() => {
            // Screenshot the story
            cy.get('#story_container').screenshot('ai_story')
            // inline the image of the story
            cy.addTestContext(
                'AI Story',
                `./screenshots/${Cypress.spec.name}/ai_story.png`
            )
            // inline the video recording of the spec in the mochawesome-report
            cy.addTestContext('Video', `./videos/${Cypress.spec.name}.mp4`)
        })
    })
})
