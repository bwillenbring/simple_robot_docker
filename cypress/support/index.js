// Plugins
// import 'cypress-plugin-retries';

// Import commands.js using ES2015 syntax:
import './commands';
// import './commands.crud';
// import './commands.entity_query_page';
// import './commands.routes';
// import './commands.login';
// import './commands.navigation';
// import './commands.qb';
// import './commands.file_uploads';



Cypress.on('uncaught:exception', (err, runnable) => {
    // yields the error (Object), mocha runnable (Object)
    // returning false here prevents Cypress from failing the test
    console.log('uncaught exception.....');
    return false;
});
