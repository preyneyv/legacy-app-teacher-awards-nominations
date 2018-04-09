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
	this.find('tbody tr').remove()
	if (!data.rubrics) return addRubricRow({},false);

	for (let rubric of data.rubrics) 
		addRubricRow(rubric, false)
}, function() {
	let output = {}
	output.name = this.find('[name=name]').val()
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