const app = require('express')()

function init() {
	const fileUpload = require('express-fileupload')
	app.use(fileUpload())

	const hbs = require('hbs')
	app.set('view engine', 'hbs')
	app.engine('hbs', hbs.__express)
	app.set('views', __dirname + '/views')
	require('./routes/api')(app)
	require('./routes/client')(app)
}

module.exports = { app, init }