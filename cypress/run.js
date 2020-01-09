// For Reading/Writing Cypress configs
const fs = require('fs');
const read = (file_path) => JSON.parse(fs.readFileSync(file_path))
const write = (new_json, file_path) => fs.writeFileSync(file_path, JSON.stringify(new_json, undefined, 2))

// For Cypress
const cypress = require('cypress')
const marge = require('mochawesome-report-generator')
const { merge } = require('mochawesome-merge')

// Overwrite your cypress configs
rewrite_cypress_configs();
// Now, run cypress
run_cypress();

// This is the function merges several json files into 1 json file
// Then, creates an html report from that 1 json file
function generateReport(options) {
  return merge(options).then(report => marge.create(report, options));
}

function rewrite_cypress_configs() {
    // Set path to the cypress config you want to use
    const path_to_config = 'cypress.json';
    // Store the configs as a json object
    const configs = read(path_to_config);
    // Modify configs using these keys from env. vars...
    configs.baseUrl = process.env['BASE_URL'];
    configs.admin_login = process.env['USERNAME'];
    configs.admin_pwd = process.env['PASSWORD'];
    configs.TEST_PROJECT = {
        "id": parseInt(process.env['TEST_PROJECT_ID'])
    }
    // Write the new config
    write(configs, path_to_config);
}

function run_cypress() {
    // Run the cypress specs
    cypress.run({
        spec: './integration/simple*.js'
    }).then((results) => {
        // Print out the results of the run...
        console.log(results)

        // Run mochawesome-merge on all .json files using these options
        const options = {
          files: ['./reports/*.json'],
        }
        generateReport(options);

        // If any test fails, send an exit code of 1 so CI knows there is a problem
        if (results.totalFailed > 0) {
            console.log('Exiting with code 1 because of failed cypress spec.');
            process.exit(1);
        }
      },
      error => {
        generateReport()
        console.error(error)
        process.exit(1)
      }
    )
}
