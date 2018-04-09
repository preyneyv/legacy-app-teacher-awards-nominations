let controller = require('../controller')

module.exports = app => {
	app.post('/api/load', controller.load)
	app.post('/api/nominate', controller.submitNomination)
	app.post('/api/abstain', controller.abstain)
}