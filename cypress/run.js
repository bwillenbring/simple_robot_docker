const cypress = require('cypress')
const marge = require('mochawesome-report-generator')
const { merge } = require('mochawesome-merge')

// See Options below
const options = {
  files: ['./reports/*.json'],
}

cypress.run().then(
  () => {
    generateReport(options)
  },
  error => {
    generateReport()
    console.error(error)
    process.exit(1)
  }
)

function generateReport(options) {
  return merge(options).then(report => marge.create(report, options));
}
