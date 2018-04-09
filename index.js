const app = require('express')()

function init() {
	require('./database')
	// app.get('/', (req, res) => res.send("It works!"))
	require('./routes/client')(app)
	require('./routes/api')(app)
}

// Export these so that the app server can use them
module.exports = { app, init }