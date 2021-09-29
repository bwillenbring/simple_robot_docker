/// <reference types="cypress" />
describe('CDC Card Scanner', function () {
    it('detects an image of a cat', function () {
        // Go to the card scanner
        cy.visit('/cdc-scanner')
        // Drop the file into the uploader
        cy.get('#file')
            .attach_file('cat.jpg', 'image/jpg')
            .then(() => {
                // Trigger the click
                cy.get('#beginUpload').trigger('click', { force: true })

                // Wait for the text area to have text
                cy.waitUntil(
                    () =>
                        cy
                            .get('#imageDetails textarea')
                            .then((textarea) =>
                                Cypress.$(textarea)
                                    .val()
                                    .includes('is_valid_card')
                            ),
                    {
                        timeout: 45000,
                        interval: 500,
                    }
                ).then(() => {
                    // Make assertions on the result
                    cy.get('#imageDetails textarea')
                        .invoke('val')
                        .then((val) => {
                            // Convert the textarea into json
                            let json = JSON.parse(val)
                            // Assert that the `is_valid_card` key is false
                            assert.isFalse(json.is_valid_card)
                            // Assert that the image detector sees a cat
                            assert.isTrue(
                                json.detected_labels
                                    .map((l) => l.toLowerCase())
                                    .includes('cat')
                            )
                            // inline the detected labels
                            cy.addTestContext(
                                'Detected Labels',
                                json.detected_labels
                            )
                            // inline the video recording of the spec in the mochawesome-report
                            cy.addTestContext(
                                'Video',
                                `./videos/${Cypress.spec.name}.mp4`
                            )
                        })
                })
            })
    })
})
