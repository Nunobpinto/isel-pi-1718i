'use strict'

const path = require('path')

module.exports = function configureHbs(hbs) {

	hbs.registerPartials(path.join(__dirname, '../../views/partials'))

	hbs.registerHelper('paginate', function(query,currentPage, totalPages, size, options) {
		let startPage, endPage, context
		let nameSearched = query

		startPage = currentPage - Math.floor(size / 2)
		endPage = currentPage + Math.floor(size / 2)

		if (startPage <= 0) {
			endPage -= (startPage - 1)
			startPage = 1
		}

		if (endPage > totalPages) {
			endPage = totalPages
			if (endPage - size + 1 > 0) {
				startPage = endPage - size + 1
			} else {
				startPage = 1
			}
		}

		context = {
			name : nameSearched,
			isFirstPage: false,
			pages: [],
			isLastPage: false,
			lastPage : totalPages
		}
		if (startPage === 1) {
			context.isFirstPage = true
		}
		for (let i = startPage; i <= endPage; i++) {
			context.pages.push({
				page: i,
				isCurrent: i === currentPage,
			})
		}
		if (endPage === totalPages) {
			context.isLastPage = true
		}
		return new hbs.SafeString(options.fn(context))
	})

	hbs.registerHelper('checkIfExists',function (items, movieID, options) {
		const context = {  }
		context.exists = items.some(item=>parseInt(item.movieId)===movieID)
		return new hbs.SafeString(options.fn(context))
	})
}