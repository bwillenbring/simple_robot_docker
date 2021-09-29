// Plugins

// Import commands.js using ES2015 syntax:
import './commands';

Cypress.on('uncaught:exception', (err, runnable) => {
    // yields the error (Object), mocha runnable (Object)
    // returning false here prevents Cypress from failing the test
    console.log('uncaught exception.....');
    return false;
});
