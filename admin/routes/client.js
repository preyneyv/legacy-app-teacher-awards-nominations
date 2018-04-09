const express = require('express')

const viewController = require('../controllers/viewController')

module.exports = app => {
	app.use(express.static(__dirname + '/../static'))

	app.get('/schools/', (req, res) => res.redirect('../'))
	app.get('/schools/:id/', viewController.school)
}