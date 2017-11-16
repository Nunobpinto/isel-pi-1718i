'use strict'

const fs = require('fs')
const hbs = require('handlebars')

module.exports = render

const base = fs.readFileSync( './views/partials/base.hbs').toString()
const footer = fs.readFileSync('./views/partials/footer.hbs').toString()
const navBar = fs.readFileSync('./views/partials/navBar.hbs').toString()
hbs.registerPartial('base', base)
hbs.registerPartial('footer', footer)
hbs.registerPartial('navBar', navBar)

const views = {
	'search': view('./views/movieListView.hbs'),
	'movies': view('./views/movieDetailsView.hbs'),
	'actors': view('./views/actorDetailsView.hbs'),
	'home': view('./views/homeView.hbs'),
	'error': view('./views/errorView.hbs')
}

function render(viewName, data, callback) {
	callback(null, views[viewName](data))
}

function view(viewPath) {
	const viewSrc = fs.readFileSync(viewPath).toString()
	return hbs.compile(viewSrc)
}

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
