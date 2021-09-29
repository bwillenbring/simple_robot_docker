const cypress = require('cypress')
const marge = require('mochawesome-report-generator')
const { merge } = require('mochawesome-merge')
const moment = require('moment')

// See Options below
const options = {
    files: ['./reports/*.json'],
    reportTitle: 'Cypress report',
}

cypress.run().then(
    (o) => {
        // Get the timestamp of the cypress run's completion
        let ts = moment(o.endedTestsAt)
        // Format the ts like... Tue. Sept 28, 2021
        let tss = `${ts.format('ddd')}. ${
            moment.monthsShort()[ts.format('M') - 1]
        } ${ts.format('D')}, ${ts.format('YYYY')} ${ts.format('h:mm a Z utc')}`

        options.reportTitle = `${tss}`
        generateReport(options)
    },
    (error) => {
        generateReport()
        console.error(error)
        process.exit(1)
    }
)

function generateReport(options) {
    return merge(options).then((report) => marge.create(report, options))
}
