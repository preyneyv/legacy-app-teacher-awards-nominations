const express = require('express')

const viewController = require('../controllers/viewController')
const importExportController = require('../controllers/importExportController')

module.exports = app => {
	app.use(express.static(__dirname + '/../static'))

	app.get('/schools/', (req, res) => res.redirect('../'))
	app.get('/schools/:id/', viewController.school)
	app.get('/schools/:id/pins', importExportController.pins)
	app.get('/schools/:id/export', importExportController.export)
	app.post('/schools/:id/import', importExportController.import)

}