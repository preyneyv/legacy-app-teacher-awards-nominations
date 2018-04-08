const app = require('express')()

function init() {
	app.get('/', (req, res) => res.send("It also works!"))
	require('./routes/api')(app)
}

module.exports = { app, init }