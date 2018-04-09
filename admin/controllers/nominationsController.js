const { Teacher, School, Position, Nomination, Settings } = require('../../database')

exports.get = async (req, res) => {
	let { id } = req.params
	let nomination = await Nomination.findOne({
		position: id,
		approved: {$exists: false}
	})
	res.send({success: true, nomination})
}

exports.submit = async (req, res) => {
	let { nominationId, status } = req.post
	console.log(status)
	let nomination = await Nomination.findByIdAndUpdate(nominationId, {
		approved: status
	})
	console.log(nomination)
	res.send({success: true})
}