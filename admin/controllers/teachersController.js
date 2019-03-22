const { Teacher, School, Nomination, Abstain, Settings } = require('../../database')

exports.create = async (req, res) => {
	// Create new teacher
	let { name, schoolId } = req.post
	let usedPins = await Teacher.distinct('pin')
	if (usedPins.length == 10000) return res.status(503).send({success: false, message: "cannot_create_more_teachers"})
	let pin = ("000" + Math.floor(Math.random()*10000)).slice(-4)
	while (usedPins.indexOf(pin) != -1)
		pin = ("000" + Math.floor(Math.random()*10000)).slice(-4)
	let teacher = new Teacher({
		name,
		pin,
		school: schoolId
	})
	try {
		await teacher.save()
		return res.status(201).send({success: true, teacher})
	} catch (e) {
		res.status(500).send({success: false})
		throw e
	}
}

exports.read = async (req, res) => {
	// Get all teachers, possibly filtered by school id
	let { schoolId } = req.get
	let teacherQ = Teacher.find()
	if (schoolId) teacherQ.where('school').eq(schoolId);

	let teachers = await teacherQ.exec()

	res.send({success: true, teachers})
}

exports.show = async (req, res) => {
	// Show one teacher, with school
	let { id } = req.params
	try {
		let teacher = await Teacher.findById(id).exec()
		if (teacher)
			res.send({success: true, teacher})
		else
			res.status(404).send({success: false, message: 'teacher_not_found'})
	} catch (e) {
		res.status(404).send({success: false, message: 'teacher_not_found'})
	}
}

exports.update = async (req, res) => {
	// Update teacher details
	let { name } = req.post
	let { id } = req.params

	try {
		let teacher = await Teacher.findByIdAndUpdate(id, {
			...(name ? { name } : {})
		}, {new: true})
		if (teacher)
			res.send({success: true, teacher})
		else
			res.status(404).send({success: false, message: 'teacher_not_found'})
	} catch (e) {
		res.status(500).send({success: false})
		throw e
	}
}

exports.delete = async (req, res) => {
	// Delete a teacher by id
	let { id } = req.params

	try {
		let teacher = await Teacher.findByIdAndRemove(id)
		await Nomination.remove({
			$or: [
				{nominee: teacher._id},
				{nominator: teacher._id}
			]
		})
		if (teacher)
			res.send({success: true})
		else 
			res.status(404).send({success: false, message: 'teacher_not_found'})
	} catch (e) {
		res.status(500).send({success: false})
		throw e
	}
}

exports.resetPin = async (req, res) => {
	// Reset a teacher's pin, by id
	let { id } = req.params

	try {
		let teacher = await Teacher.findByIdAndUpdate(id, { used: false })
		await Nomination.remove({nominator: teacher._id})
		await Abstain.remove({nominator: teacher._id})
		if (teacher)
			res.send({success: true})
		else
			res.status(404).send({success: false, message: 'teacher_not_found'})
	} catch (e) {
		res.status(500).send({success: false})
		throw e
	}
}