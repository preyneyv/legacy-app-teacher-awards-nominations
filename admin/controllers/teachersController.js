const { Teacher, School, Settings } = require('../../database')

exports.create = async (req, res) => {
	// Create new teacher
	let { name, schoolId } = req.post
	let teacher = new Teacher({
		name,
		school: schoolId
	})
	try {
		await teacher.save()
		return res.send({success: true, teacher})
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
			res.send({success: false, message: 'teacher_not_found'})
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
		if (teacher)
			res.send({success: true})
		else 
			res.send({success: false, message: 'teacher_not_found'})
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
		if (teacher)
			res.send({success: true})
		else
			res.send({success: false, message: 'teacher_not_found'})
	} catch (e) {
		res.status(500).send({success: false})
		throw e
	}
}