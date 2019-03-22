let renameModal = new FormModal('#rename-modal', function(data) {
	for (let key of Object.keys(data))
		this.find(`[name=${key}]`).val(data[key])
}, function() {
	let data = this.find('form').serializeArray()
	let op = {}
	for (let datum of data) 
		op[datum.name] = datum.value
	return op
})

function addRubricRow(rubric={}, autofocus=true) {
	rubric.descriptions = rubric.descriptions || []
	let row = $("<tr>")
	.append(
		$('<td>')
		.append(
			$('<input>')
			.val(rubric.name)
			.addClass('rubric-name')
			.attr('placeholder', 'Rubric Name')
			.prop('required', true)
		)
	)
	.append(
		$('<td>')
		.append(
			$('<textarea>')
			.text(rubric.descriptions[0])
			.addClass('rubric-description')
			.attr('placeholder', 'Description')
			.prop('required', true)
		)
	)
	.append(
		$('<td>')
		.append(
			$('<textarea>')
			.text(rubric.descriptions[1])
			.addClass('rubric-description')
			.attr('placeholder', 'Description')
			.prop('required', true)
		)
	)
	.append(
		$('<td>')
		.append(
			$('<textarea>')
			.text(rubric.descriptions[2])
			.addClass('rubric-description')
			.attr('placeholder', 'Description')
			.prop('required', true)
		)
	)
	.append(
		$('<td>')
		.addClass('actions')
		.append(
			$('<i>')
			.addClass('material-icons delete-row')
			.text('delete')
		)
	)
	row.find('.delete-row').on('click', () => {
		row.remove()
		if ($("#new-position-rubrics tbody tr").length == 0)
			addRubricRow()
	})
	row.appendTo('#new-position-rubrics tbody');
	if (autofocus) row.find('.rubric-name').focus();
}
$("#add-rubric").on('click', () => addRubricRow())
let positionModal = new FormModal('#new-position-modal', function(data) {
	this.find('[name=name]').val(data.name)
	this.find('[name=description]').val(data.description)
	this.find('tbody tr').remove()
	if (!data.rubrics) return addRubricRow({},false);

	for (let rubric of data.rubrics) 
		addRubricRow(rubric, false)
}, function() {
	let output = {}
	output.name = this.find('[name=name]').val()
	output.description = this.find('[name=description]').val()
	output.rubrics = []
	this.find('#new-position-rubrics tbody tr').each(function() {
		let name = $(this).find('.rubric-name').val()
		let descriptions = $(this).find('.rubric-description')
			.map(function() { return $(this).val() })
			.get()
		output.rubrics.push({
			name,
			descriptions
		})
	})
	return output
})

let resultsModal = new ContentModal('#results-modal', function(data) {
	let sorted = data.sort((a, b) => b.score - a.score)
	$('#results-modal tbody').empty()
	if (!sorted.length) {
		// no rows
		$('#results-modal tbody').append(
			$('<tr>')
			.append(
				$('<td>')
				.addClass('no-more')
				.attr('colspan', 3)
				.text('No results to show.')
			)
		)
	} else {
		for (let person of sorted) {
			let row = $('<tr>')
			.append($('<td>'))
			.append(
				$('<td>')
				.text(person.name)
			)
			.append(
				$('<td>')
				.text(person.score + ' points')
			)
			row.appendTo('#results-modal tbody')
		}
	}

}, function() {})


let nominationModal = new (function(showHandler, closeHandler) {
	let modal = $('#nomination-modal')
	this.show = (title, data={}) => new Promise((resolve, reject) => {
		$('body').addClass('show-modal')
		modal.addClass('show')
		modal.find('h1').text(title)
		showHandler.call(modal, data)
		$('#nomination-close').on('click', close)
		$('#nomination-reject').on('click', function() {
			// if (!confirm('Are you sure you want to reject this?')) return;
			submitResponse(false, data.nomination.position, data.nomination._id, title, data.rubrics)
		})
		$('#nomination-accept').on('click', function() {
			// if (!confirm('Are you sure you want to accept this?')) return;
			submitResponse(true, data.nomination.position, data.nomination._id, title, data.rubrics)
		})
	})
	function close() {
		modal.find('*').off()
		modal.removeClass('show')
		$('body').removeClass('show-modal')
	}
	function submitResponse(status, positionId, nominationId, title, rubrics) {
		axios.post(url(`api/positions/${positionId}/nomination/?${Date.now()}`), {
			nominationId, status
		})
		.then(() => axios.get(url(`api/positions/${positionId}/nomination/?${Date.now()}`)))
		.then(response => response.data)
		.then(data => {
			if (data.success) {
				if (data.nomination) {
					close()
					nominationModal.show(title, {
						nomination: data.nomination,
						rubrics
					})
				} else {
					close()
				}
			}
		})
	}
})(function(data) {
	let { nomination, rubrics } = data
	let nominator = school.teachers.find(t => t._id == nomination.nominator)
	let nominee = school.teachers.find(t => t._id == nomination.nominee)
	$('#nomination-ratings tbody').empty().append(
		nomination.ratings.map((score, i) => {
			return $('<tr>')
			.append(
				$('<td>')
				.text(rubrics[i].name)
			)
			.append(
				$('<td>')
				.text(score == 3 ? 'Excellent' : score == 2 ? 'Very Good' : 'Good')
			)
		})
	)
	$('#nomination-nominator').text(nominator.name)
	$('#nomination-nominee').text(nominee.name)
	$('#nomination-reason').text(nomination.reason)
}, function() {})