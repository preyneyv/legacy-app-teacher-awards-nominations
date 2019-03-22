const { Teacher, School, Position, Nomination, Settings } = require('../../database')

exports.create = async (req, res) => {
	// Create new position
	let { name, description, rubrics, schoolId } = req.post
	let position = new Position({
		name,
		description,
		rubrics,
		school: schoolId
	})
	try {
		await position.save()
		return res.status(201).send({success: true, position})
	} catch (e) {
		res.status(500).send({success: false})
		throw e
	}
}

exports.update = async (req, res) => {
	// Update position details
	let { name, description, rubrics } = req.post
	let { id } = req.params

	try {
		let position = await Position.findByIdAndUpdate(id, {
			...(name ? { name } : {}),
			...(description ? { description } : {}),
			...(rubrics ? { rubrics } : {})
		}, {new: true})
		if (position)
			res.send({success: true, position})
		else
			res.status(404).send({success: false, message: 'position_not_found'})
	} catch (e) {
		res.status(500).send({success: false})
		throw e
	}
}

exports.delete = async (req, res) => {
	// Delete a position by id
	let { id } = req.params

	try {
		let position = await Position.findByIdAndRemove(id)
		await Nomination.remove({
			position: position._id
		})
		if (position)
			res.send({success: true})
		else 
			res.status(404).send({success: false, message: 'position_not_found'})
	} catch (e) {
		res.status(500).send({success: false})
		throw e
	}
}

exports.show = async (req, res) => {
	let { id } = req.params
	let position = await Position.findById(id).populate('nominations')
	if (position)
		res.send({success: true, position})
	else
		res.status(404).send({success: false, message: 'position_not_found'})
}