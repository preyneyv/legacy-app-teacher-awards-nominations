const { Teacher, School, Settings } = require('../../database')

exports.create = async (req, res) => {
	// Create new school
	let { name } = req.post
	let school = new School({
		name
	})
	try {
		await school.save()
		return res.status(201).send({success: true, school})
	} catch (e) {
		res.status(500).send({success: false})
		throw e
	}
}

exports.read = async (req, res) => {
	// List schools
	let teachers = 'teachers' in req.get
	let schoolsQ = School.find()
	if (teachers)
		schoolsQ.populate('teachers')

	let schools = await schoolsQ.exec()

	res.send({success: true, schools})
}

exports.update = async (req, res) => {
	// Update school details
	let { name } = req.post
	let { id } = req.params

	try {
		let school = await School.findByIdAndUpdate(id, {
			...(name ? { name } : {})
		}, {new: true})
		if (school)
			res.send({success: true, school})
		else
			res.status(404).send({success: false, message: 'school_not_found'})
	} catch (e) {
		res.status(500).send({success: false})
		throw e
	}
}

exports.delete = async (req, res) => {
	// Delete a school by id
	let { id } = req.params

	try {
		let school = await School.findByIdAndRemove(id)
		if (school)
			res.send({success: true})
		else 
			res.status(404).send({success: false, message: 'school_not_found'})
	} catch (e) {
		res.status(500).send({success: false})
		throw e
	}
}