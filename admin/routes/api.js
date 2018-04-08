const teachersController = require('../controllers/teachersController')

module.exports = app => {
	app.route('/api/teachers')
	.put(teachersController.create)
	.get(teachersController.read)

	app.route('/api/teachers/:id')
	.post(teachersController.update)
	.delete(teachersController.delete)

	app.post('/api/teachers/:id/reset', teachersController.resetPin)
}