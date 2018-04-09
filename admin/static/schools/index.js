let baseUrl = "schools/someId/"

$(window).on('load', () => {
	drawTables()
})

let school, teachersTable, positionsTable

function loadData() {
	return axios.get(url('api/schools/' + schoolId))
	.then(response => response.data)
	.then(data => {
		school = data.school
	})
}

function drawTables() {
	loadData()
	.then(() => {
		drawTeachersTable();
		drawPositionsTable();
		$("#create-teacher").on('click', function() {
			renameModal.show('Add Teacher')
			.then(data => {
				if (!data) throw "nope";
				$('#teachers-table').addClass('loading')
				return axios.post(url('api/teachers'), {
					name: data.name,
					schoolId
				})
			})
			.then(response => response.data)
			.then(data => {
				$('#teachers-table').removeClass('loading')
				if (data.success) {
					let newTeacher = data.teacher
					school.teachers.push(newTeacher)
					teachersTable.clear().rows.add(school.teachers).draw(false)
					
				} else {
					alert("Server says " + data.message)
				}
			})
			.catch(e => {if (typeof e != 'string') throw e})
		})
		$("#create-position").on('click', function() {
			positionModal.show('Add Position')
			.then(data => {
				if (!data) throw "nope";
				console.log(data)
				$('#positions-table').addClass('loading')
				return axios.post(url('api/positions'), {
					name: data.name,
					rubrics: data.rubrics,
					schoolId
				})
			})
			.then(response => response.data)
			.then(data => {
				$('#positions-table').removeClass('loading')
				if (data.success) {
					let newPosition = data.position
					school.positions.push(newPosition)
					positionsTable.clear().rows.add(school.positions).draw(false)
					
				} else {
					alert("Server says " + data.message)
				}
			})
			.catch(e => {if (typeof e != 'string') throw e})
		})
	})
}

let teacherEvents = {
	edit: function() {
		let rowIndex = $(this).data('row')
		let row = teachersTable.row(rowIndex)
		renameModal.show('Edit Teacher', {
			name: row.data().name
		})
		.then((data) => {
			if (!data) throw "nope";
			$('#teachers-table').addClass('loading')
			return axios.patch(url('api/teachers/' + row.data()._id), data)
		})
		.then(response => response.data)
		.then(data => {
			$('#teachers-table').removeClass('loading')
			row.data(data.teacher).invalidate()
			school.teachers[rowIndex] = data.teacher
			teacherEvents.bindRow($(row.node()))
		})
		.catch(e => {if (typeof e != 'string') {throw e}})
	},
	delete: function() {
		if (!confirm('Do you want to delete this row?')) return
		let rowIndex = $(this).data('row')
		let row = teachersTable.row(rowIndex)
		console.log(row, rowIndex)
		$('#teachers-table').addClass('loading')
		axios.delete(url('api/teachers/' + row.data()._id))
		.then(response => response.data)
		.then(data => {
			$('#teachers-table').removeClass('loading')
			school.teachers.splice(rowIndex, 1)
			teachersTable.clear().rows.add(school.teachers).draw(false)
			if ($("#teachers-table tbody tr").length == 0) {
				// edge case where all but last page deleted
				teachersTable.page(0).draw()
			}
		})
	},
	reset: function() {
		if ($(this).is('.disabled')) return;
		let rowIndex = $(this).data('row')
		let row = teachersTable.row(rowIndex)
		$('#teachers-table').addClass('loading')
		axios.post(url('api/teachers/' + row.data()._id + '/reset'))
		.then(response => response.data)
		.then(data => {
			$('#teachers-table').removeClass('loading')
			if (data.success) {
				let newData = row.data()
				newData.used = false
				school.teachers[rowIndex] = newData
				row.data(newData).invalidate()
				teacherEvents.bindRow($(row.node()))
			} else {
				alert('The server said ' + data.message)
			}
		})
	},
	bindRow: function($row) {
		$row.find('.teacher-edit').off().on('click', this.edit)
		$row.find('.teacher-delete').off().on('click', this.delete)
		$row.find('.teacher-reset').off().on('click', this.reset)
	}
}
function drawTeachersTable() {
	teachersTable = $('#teachers-table').DataTable({
		data: school.teachers,
		columns: [
			{ data: 'name' },
			{ data: 'pin' },
			{ 
				data: 'used',
				render: (data, type, row) => {
					return data ? 'Used' : 'Not Used'
				}
			},
			{
				data: '_id',
				render: (data, type, row, meta) => {
					let disabledFlag = row.used ? "" : 'disabled'
					return `
						<i data-row='${meta.row}' class='material-icons ${disabledFlag} teacher-reset'>refresh</i>
						<i data-row='${meta.row}' class='material-icons teacher-edit'>edit</i>
						<i data-row='${meta.row}' class='material-icons teacher-delete'>delete</i>
					`
				}
			}
		],
		columnDefs: [
			{
				targets: -1,
				sortable: false,
				searchable: false,
				className: 'actions'
			},
		],
		autoWidth: false,
		drawCallback: function() {
			$("#teachers-table .teacher-edit").off().on('click', teacherEvents.edit)
			$("#teachers-table .teacher-delete").off().on('click', teacherEvents.delete)
			$("#teachers-table .teacher-reset").off().on('click', teacherEvents.reset)
		}
	})
}

let positionEvents = {
	edit: function() {
		let rowIndex = $(this).data('row')
		let row = positionsTable.row(rowIndex)
		positionModal.show('Edit Position', {
			name: row.data().name,
			rubrics: row.data().rubrics
		})
		.then((data) => {
			if (!data) throw "nope";
			$('#positions-table').addClass('loading')
			return axios.patch(url('api/positions/' + row.data()._id), data)
		})
		.then(response => response.data)
		.then(data => {
			$('#positions-table').removeClass('loading')
			row.data(data.position).invalidate()
			school.positions[rowIndex] = data.position
			positionEvents.bindRow($(row.node()))
		})
		.catch(e => {if (typeof e != 'string') {throw e}})
	},
	delete: function() {
		if (!confirm('Do you want to delete this row?')) return
		let rowIndex = $(this).data('row')
		let row = positionsTable.row(rowIndex)
		$('#positions-table').addClass('loading')
		axios.delete(url('api/positions/' + row.data()._id))
		.then(response => response.data)
		.then(data => {
			$('#positions-table').removeClass('loading')
			school.positions.splice(rowIndex, 1)
			positionsTable.clear().rows.add(school.positions).draw(false)
			if ($("#positions-table tbody tr").length == 0) {
				// edge case where all but last page deleted
				positionsTable.page(0).draw()
			}
			row.remove().draw()
		})
	},
	results: function() {
		let rowIndex = $(this).data('row')
		let row = positionsTable.row(rowIndex)
		let id = row.data()._id
		$('#positions-table').addClass('loading')
		axios.get(url('api/positions/' + id))
		.then(response => response.data)
		.then(data => {
			if (data.success) {
				let nominees = _(data.position.nominations)
				.filter({approved: true})
				.groupBy('nominee')
				.value()
				// Get total sum
				for (let id of Object.keys(nominees)) {
					let score = nominees[id].reduce((sum, obj) => {
						return sum + obj.ratings.reduce((s, e) => s + e, 0)
					}, 0)
					let teacher = school.teachers.find(t => t._id == id)
					nominees[id] = {
						score,
						name: teacher.name 
					}
				}
				$('#positions-table').removeClass('loading')
				return resultsModal.show("Results", Object.values(nominees))
			} else {
				$('#positions-table').removeClass('loading')
				alert('Server says ' + data.message)
			}
		})
	},
	nominations: function() {
		let rowIndex = $(this).data('row')
		let row = positionsTable.row(rowIndex)
		let id = row.data()._id;
		let rubrics = row.data().rubrics;
		$('#positions-table').addClass('loading')
		axios.get(url(`api/positions/${id}/nomination`))
		.then(response => response.data)
		.then(data => {
			$('#positions-table').removeClass('loading')
			if (data.success) {
				if (!data.nomination) return alert('No nominations to check.')
				nominationModal.show(row.data().name, {
					nomination: data.nomination,
					rubrics
				})
			} else {
				alert('Server says ' + data.message)
			}
		})
	},
	bindRow: function($row) {
		$row.find('.position-edit').off().on('click', this.edit)
		$row.find('.position-delete').off().on('click', this.delete)
		$row.find('.view-results').off().on('click', this.results)
		$row.find('.view-nominations').off().on('click', this.nominations)
	}
}
function drawPositionsTable() {
	positionsTable = $('#positions-table').DataTable({
		data: school.positions,
		columns: [
			{ data: 'name' },
			{
				render: (data, type, row, meta) => {
					return `<button data-row='${meta.row}' class='view-results'>View</button>`
				}
			},
			{
				render: (data, type, row, meta) => {
					return `<button data-row='${meta.row}' class='view-nominations'>View</button>`
				}
			},
			{
				render: (data, type, row, meta) => {
					return `
						<i data-row='${meta.row}' class='material-icons position-edit'>edit</i>
						<i data-row='${meta.row}' class='material-icons position-delete'>delete</i>
					`
				}
			},
		],
		columnDefs: [
			{
				targets: -1,
				sortable: false,
				searchable: false,
				className: 'actions'
			},
			{
				targets: [-2, -3],
				sortable: false,
				searchable: false,
				className: 'view-buttons'
			}
		],
		autoWidth: false,
		drawCallback: function() {
			$("#positions-table .position-edit").off().on('click', positionEvents.edit)
			$("#positions-table .position-delete").off().on('click', positionEvents.delete)
			$("#positions-table .view-results").off().on('click', positionEvents.results)
			$("#positions-table .view-nominations").off().on('click', positionEvents.nominations)
		}
	})
}

// Changing school name
let oldName;
$("#school-name").on('focus', function() {
	oldName = $(this).val()
})
$("#school-name").on('input', function() {
	$("#sidebar .current").html($(this).val() || `
		<div style='text-align: center; opacity: 0.5; color: black'>&mdash;</div>
	`)
})
$("#school-name").on('blur', function() {
	if ($(this).val() == "") $(this).val(oldName);
	$("#sidebar .current").html($(this).val())
	if (oldName == $(this).val()) return;
	let name = $(this).val()
	$(this).prop('disabled', true)
	axios.patch(url('api/schools/' + schoolId), {name})
	.then(response => response.data)
	.then(data => {
		if (data.success) {
			$(this).prop('disabled', false)
		} else {
			alert('Server says' + data.message)
		}
	})
	.catch(e => {
		alert('Oh no! Something went wrong!')
		throw e
	})
})

$("#school-delete").on('click', function() {
	if (!confirm('Are you sure you want to delete this school?')) return;
	axios.delete(url('api/schools/' + schoolId))
	.then(response => response.data)
	.then(data => {
		if (data.success) {
			alert('Successfully deleted school!')
			window.location.href = '../../'
		} else {
			alert('Server says ' + data.message)
		}
	})
	.catch(e => {
		alert ('Oh no! Something went wrong!')
		throw e
	})
})