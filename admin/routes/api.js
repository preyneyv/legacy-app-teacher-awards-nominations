const teachersController = require('../controllers/teachersController')
const schoolsController = require('../controllers/schoolsController')
const positionsController = require('../controllers/positionsController')
const nominationsController = require('../controllers/nominationsController')

module.exports = app => {
	app.route('/api/schools')
	.post(schoolsController.create)
	.get(schoolsController.read)

	app.route('/api/schools/:id')
	.get(schoolsController.show)
	.patch(schoolsController.update)
	.delete(schoolsController.delete)


	app.route('/api/positions')
	.post(positionsController.create)

	app.route('/api/positions/:id')
	.patch(positionsController.update)
	.delete(positionsController.delete)
	.get(positionsController.show)
	app.route('/api/positions/:id/nomination')
	.get(nominationsController.get)
	.post(nominationsController.submit)

	app.route('/api/teachers')
	.post(teachersController.create)
	.get(teachersController.read)

	app.route('/api/teachers/:id')
	.get(teachersController.show)
	.patch(teachersController.update)
	.delete(teachersController.delete)

	app.post('/api/teachers/:id/reset', teachersController.resetPin)
}