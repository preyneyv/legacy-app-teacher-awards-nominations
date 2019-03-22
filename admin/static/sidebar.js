
let url = path => {
	let dirs = baseUrl.split('/').length - 1
	for (var i = dirs - 1; i >= 0; i--)
		path = "../" + path
	return path
}

// Load schools
let schools
axios.get(url('api/schools/'))
.then(response => response.data)
.then(data => {
	schools = data.schools.sort((a, b) => a.name > b.name ? 1 : -1)
	createSchools(schools)
	$("#loading-schools").remove()
})

function createSchools(schools) {
	for (let school of schools) {
		let a = $("<a>")
		let base = url('schools/' + school._id + '/')
		a.attr('href', base)
		.text(school.name)
		.addClass('school')

		a.insertBefore('#add-school')
		try {
			if (school._id == schoolId) {
				a.addClass('current')
			}
		} catch (e) {}
	}
}

let newSchoolModal = new FormModal('#add-school-modal', function(data) {}, function() {
	let data = this.find('form').serializeArray()
	let op = {}
	for (let datum of data) 
		op[datum.name] = datum.value
	return op
})
$('#add-school').on('click', () => {
	newSchoolModal.show('Add School')
	.then(data => {
		if (!data) throw "nope";
		return axios.post(url('api/schools'), { name: data.name })
	})
	.then(response => response.data)
	.then(data => {
		if (data.success) {
			let school = data.school
			schools.push(school)
			schools = schools.sort((a, b) => a.name > b.name ? 1 : -1)
			$("#sidebar .school").remove()
			createSchools(schools)
		}
	})
	.catch(e => {if (typeof e != 'string') throw e})
})