const app = require('express')()

function init() {
	require('./routes/api')(app)
}

module.exports = { app, init }