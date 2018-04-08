const app = require('express')()

function init() {
	app.get('/', (req, res) => res.send("It also works!"))
}

module.exports = { app, init }