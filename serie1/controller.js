'use strict'

const movieService = require('./service/movieService')()
const render = require('./service/viewService')

module.exports = {
	home,
	search,
	movies,
	actors
}

function home(request, callback) {
	render('home', null, callback)
}

function search(request, callback) {
	const name = request.query['name']
	const page = request.query['page']
	movieService.getMovieList(name,page, (err, data) => {
		if(err)
			return callback(err)
		render('search', data, callback)
	})
}

function movies(request, callback) {
	const movieId = request.pathname.split('/')[2]
	movieService.getMovieDetails(movieId, (err, data) => {
		if(err)
            return callback(err)
		render('movies', data, callback)
	})
}

function actors(request, callback) {
	const actorId = request.pathname.split('/')[2]
	movieService.getActorDetails(actorId, (err, data) => {
		if(err)
            return callback(err)
		render('actors', data, callback)
	})
}