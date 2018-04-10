const { Teacher, School, Position, Nomination, Abstain, Settings } = require('../../database')
const Papa = require('papaparse')
const Excel = require('exceljs')

exports.import = async (req, res) => {
	if (!req.files || !req.files.teachers) return res.status(400).send({success: false, message: 'missing_files'});
	let schoolId = req.params.id
	let teachers = Papa.parse(req.files.teachers.data.toString(), {header: true})
	if (JSON.stringify(teachers.meta.fields) != '["name"]')
		return res.send({success: false, message: 'teachers_file_invalid'})
	await Teacher.remove({school: schoolId})
	let positionIds = (await Position.find({school: schoolId})).map(p => p._id)
	await Nomination.remove({position: {$in: positionIds}})
	await Abstain.remove({position: {$in: positionIds}})
	let usedPins = []
	for (let t of teachers.data) {
		let pin = ("0000" + Math.floor(Math.random() * 10000)).substr(-4, 4)
		while (usedPins.indexOf(pin) != -1) {
			// get a new pin.
			pin = ("0000" + Math.floor(Math.random() * 10000)).substr(-4, 4)
		}
		usedPins.push(pin)
		await (new Teacher({
			name: t.name,
			pin,
			school: schoolId
		})).save()
	}
	res.send({success: true})
}

exports.export = async (req, res) => {
	let school = req.params.id
	let name = (await School.findById(school)).name
	res.writeHead(200, {
		'Content-Disposition': `attachment; filename="${name}.xlsx"`,
		'Transfer-Encoding': 'chunked',
		'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	})

	let workbook = new Excel.stream.xlsx.WorkbookWriter({ stream: res })
	let abstainSheet = workbook.addWorksheet('Abstains')
	let positions = await Position.find({ school })
	.populate({ path:'nominations', populate: { path: 'nominee' } })
	.populate({ path:'nominations', populate: { path: 'nominator' } })
	let positionIds = positions.map(p => p.toJSON()._id)

	let abstains = await Abstain.find({ position: {$in: positionIds} })
	.populate('position').populate('nominator')
	abstainSheet.addRow(['Position', 'Nominator', 'Reason'])
	for (let abstain of abstains)
		abstainSheet.addRow([abstain.position.name, abstain.nominator.name, abstain.reason]).commit()
	abstainSheet.commit()

	for (let position of positions) {
		let sheet = workbook.addWorksheet(position.name)
		sheet.addRow(['Nominator', 'Nominee', 
			...(position.rubrics.map(r => r.name)), 
			'Comments', 'Approved'
		])
		for (let nomination of position.nominations) {
			sheet.addRow([
				nomination.nominator.name,
				nomination.nominee.name,
				...(nomination.ratings), 
				nomination.reason,
				(nomination.approved ? 'Yes' : 'No')
			]).commit()
		}
		sheet.commit()
	}

	workbook.commit()
}