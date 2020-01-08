const cypress = require('cypress')
const marge = require('mochawesome-report-generator')
const { merge } = require('mochawesome-merge')

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

// This is the function merges several json files into 1 json file
// Then, creates an html report from that 1 json file
function generateReport(options) {
  return merge(options).then(report => marge.create(report, options));
}
