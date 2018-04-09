let FormModal = function(selector, showHandler, submitHandler) {
	let modal = $(selector)
	this.show = (title, data={}) => new Promise((resolve, reject) => {
		$('body').addClass('show-modal')
		modal.addClass('show')
		modal.find('h1').text(title)
		modal.find('input, textarea').val(null)
		modal.find('input, textarea ').eq(0).focus()
		showHandler.call(modal, data)
		modal.find('.modal-cancel, .modal-close').on('click', () => {
			modal.find('*').off()
			close()
			resolve(false)
		})
		modal.find('form').one('submit', e => {
			close()
			e.preventDefault()
			e.stopPropagation()
			modal.find('*').off()
			modal.find(':focus').blur()
			let output = submitHandler.call(modal)
			resolve(output)
		})
	})
	function close() {
		modal.removeClass('show')
		$('body').removeClass('show-modal')
	}
}
let ContentModal = function(selector, showHandler, closeHandler) {
	let modal = $(selector)
	this.show = (title, data={}) => new Promise((resolve, reject) => {
		$('body').addClass('show-modal')
		modal.addClass('show')
		modal.find('h1').text(title)
		showHandler.call(modal, data)
		modal.find('.modal-close, .modal-primary').on('click', () => {
			modal.find('*').off()
			close()
			closeHandler.call(modal, data)
			resolve()
		})
	})
	function close() {
		modal.removeClass('show')
		$('body').removeClass('show-modal')
	}
}
