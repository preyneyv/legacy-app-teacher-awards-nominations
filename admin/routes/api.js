const teachersController = require('../controllers/teachersController')
const schoolsController = require('../controllers/schoolsController')

module.exports = app => {
	app.route('/api/schools')
	.post(schoolsController.create)
	.get(schoolsController.read)

	app.route('/api/schools/:id')
	.patch(schoolsController.update)
	.delete(schoolsController.delete)


	app.route('/api/teachers')
	.post(teachersController.create)
	.get(teachersController.read)

	app.route('/api/teachers/:id')
	.get(teachersController.show)
	.patch(teachersController.update)
	.delete(teachersController.delete)

	app.post('/api/teachers/:id/reset', teachersController.resetPin)
}