let { Abstain, Teacher, School, Position, Nomination, Settings } = require('./database')

exports.load = async (req, res) => {
	let { pin } = req.post
	let teacher = await Teacher.findOneAndUpdate({ pin }, { used: true })
	.populate({
		path: 'school',
		populate: { path: 'teachers' }
	})
	.populate({
		path: 'school',
		populate: { path: 'positions' }
	})
	if (!teacher) return res.send({success: false, message: 'pin_not_found'});
	if (teacher.used) return res.send({success: false, message: 'pin_already_used'});

	// Aight! We got our teacher!
	res.send({success: true, teacher})
}

exports.submitNomination = async (req, res) => {
	let {position, nominee, nominator, ratings, reason} = req.post
	let nomination = new Nomination({
		position,
		nominee,
		nominator,
		ratings,
		reason
	})
	await nomination.save()
	res.send({success: true})
}
exports.abstain = async (req, res) => {
	let { position, nominator, reason } = req.post
	let abstain = new Abstain({
		position,
		nominator,
		reason
	})
	await abstain.save()
	res.send({success: true})
}