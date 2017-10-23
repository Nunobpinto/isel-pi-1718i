'use strict'

const fs = require('fs')
const hbs = require('handlebars')



module.exports = render

const base = fs.readFileSync( './views/base.hbs').toString()
const footer = fs.readFileSync('./views/footer.hbs').toString()
const navBar = fs.readFileSync('./views/navBar.hbs').toString()
hbs.registerPartial('base', base)
hbs.registerPartial('footer', footer)
hbs.registerPartial('navBar', navBar)

const views = {
	'search': view('./views/movieListView.hbs'),
	'movies': view('./views/movieDetailsView.hbs'),
	'actors': view('./views/actorDetailsView.hbs'),
	'home': view('./views/homeView.hbs'),
	'404': view('./views/404.hbs'),
	'500' : view('./views/500.hbs')
}

function render(viewName, data, callback) {
	callback(null, views[viewName](data))
}

function view(viewPath) {
	const viewSrc = fs.readFileSync(viewPath).toString()
	return hbs.compile(viewSrc)
}