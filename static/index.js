let votingTemplate = Handlebars.compile($("#voting-table").html())

var numberRegex = /[0-9]/;
var pin;
$("#pin-input").on('keypress', function (e) {
	var code = e.which || e.code
	e.key = e.key || String.fromCharCode(code)	

	if (!numberRegex.test(e.key) || $("#pin-input").val().length === 4) {
		e.preventDefault();
		e.stopPropagation();
		return;
	}

	if ($("#pin-input").val().length === 3) {
		$('#pin-input').val($('#pin-input').val() + e.key)
		$("#pin-input").prop('disabled', true).blur();
		pin = ("0000" + parseInt($("#pin-input").val())).substr(-4,4); 
		submitPin(pin);
	}
});

let teacher, school, currentIndex = 0
function submitPin(pin) {
	axios.post('api/load', { pin })
	.then(response => response.data)
	.then(data => {
		if (data.success) {
			// We're in business!
			teacher = data.teacher
			school = teacher.school
			school.positions = school.positions.map(position => ({
				...position,
				rubrics: position.rubrics.map(rubric => ({
					name: rubric.name,
					excellent: rubric.descriptions[0],
					veryGood: rubric.descriptions[1],
					good: rubric.descriptions[2],
				}))
			}))
			showViews()
			$('body').addClass('voting')
		} else {
			if (data.message == 'pin_not_found')
				alert('Unknown pin.')
			if (data.message == 'pin_already_used')
				alert('Pin has already been used.')
			$('#pin-input').prop('disabled', false).focus().val('')
		}
	})
	.catch(e => {
		alert("Oh no! Something went wrong!")
		alert("Don't close this alert.\n\n" + e.stack || e)
		throw e
	})
}

function showViews() {
	$('#page-form').on('submit', formSubmit)
	$('#abstain-button').on('click', function() {
		let reason = prompt('What is your reason for abstaining? Leave blank to cancel.')
		if (!reason) return;
		axios.post('api/abstain', {
			nominator: teacher._id,
			position: school.positions[currentIndex]._id,
			reason
		})
		nextView()
	})
	showPosition(school.positions[0])
	for (let t of school.teachers.sort((a, b) => a.name > b.name ? 1 : -1)) {
		$('#nominee').append(
			$('<option>')
			.attr('value', t._id)
			.text(t.name)
		)
	}
}

function resizeTable() {
	$("#rubrics-table tbody tr").each(function() {
		let row = $(this)
		let max = 0
		row.find('td').each(function() {
			if ($(this).height() > max) max = $(this).height()
		})
		row.find('label').height(max - 32)
	})
}

$(window).on('resize', resizeTable)

function showPosition(position) {
	$('.page-header').text(position.name)
	$('.page-description span').text(position.description)
	console.log(position)
	let table = votingTemplate(position)
	$("#rubrics-table tbody").empty().append(table)
	$("#nominee").val('')
	$("#comments").val('')
	resizeTable()
}

function formSubmit(e) {
	e.preventDefault()
	e.stopPropagation()
	if (!confirm('Are you sure you want to continue?')) return;
	let array = $(this).serializeArray()
	let position = school.positions[currentIndex]._id
	let nominee = array.find(e => e.name == 'nominee').value
	let nominator = teacher._id
	let reason = array.find(e => e.name == 'comments').value
	let ratings = array.filter(e => !isNaN(parseInt(e.name)))
	.map(rating => parseInt(rating.value))
	axios.post('api/nominate', {
		position, nominee, nominator, reason, ratings
	})
	.then(response => response.data)
	.then(data => {
		if (data.success) {
			console.log("Submitted")
		}
	})
	nextView()
}

function nextView() {
	currentIndex++
	if (currentIndex == school.positions.length) {
		// We're done!
		alert('Thank you for participating!')
		window.location.reload();
		return
	}
	showPosition(school.positions[currentIndex])
}
