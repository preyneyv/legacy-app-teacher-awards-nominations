const { Teacher, School, Settings } = require('../../database')

exports.school = async (req, res) => {
	let school
	try {
		school = await School.findById(req.params.id)
		if (!school) throw "no school!"
	} catch (e) {
		res.redirect('../../')
	}
	res.render('school', { school })
}