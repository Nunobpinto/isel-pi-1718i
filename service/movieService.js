'use strict'

'use strict'

const fs = require('fs')
const actorCache = require('../cache')
const movieCache = require('../cache')
const BadRequest = require('../errors/BadRequest')
const Actor = require('../model/Actor')
const CastMember = require('../model/CastMember')
const Director = require('../model/Director')
const Movie = require('../model/Movie')
const MovieListItem = require('../model/MovieListItem')
const memoize = require('../memoize')

const apiKey = fs.readFileSync('apikey.txt').toString()

module.exports = init

function init(dataSource) {
	let req
	if (dataSource)
		req = dataSource
	else
		req = require('request')

	const services = {
		getMovieList,
		'getMovieDetails' : memoize(getMovieDetails,movieCache),
		'getActorDetails' : memoize(getActorDetails,actorCache)
	}
	return services

	function getMovieList(name, cb) {
		if(name === ''){
			return cb(new BadRequest('Attention: Movie name is required!'))
		}
		const movieListPath = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${name}`
		req(movieListPath, (err, res, data) => {
			console.log('Making a request to ' + movieListPath)
			if (err) return cb(err)
			const obj = JSON.parse(data.toString())
			let movieListDto = {}
			movieListDto.results = obj.results.map(item => new MovieListItem(item.title, item.id, item.release_date, item.poster_path, item.vote_average))
			cb(null, movieListDto)
		})
	}

	function getMovieDetails(movieId, cb) {
		const movieDetailsPath = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`
		const movieCreditsPath = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`
		req(movieDetailsPath, (err, res, data) => {
			console.log('Making a request to ' + movieDetailsPath + ' and ' + movieCreditsPath)
			if (err) return cb(err)
			let obj = JSON.parse(data.toString())
			let movieDetailsDto = new Movie(obj.tagline, obj.id, obj.original_title, obj.overview, obj.release_date, obj.vote_average, obj.poster_path, obj.genres.map(item => item.name).join(' / '))
			req(movieCreditsPath, (err, res, data) => {
				if (err) return cb(err)
				obj = JSON.parse(data.toString())
				movieDetailsDto.directors =
																				obj.crew
																					.filter(crewMember => crewMember.job === 'Director')
																					.map(director => new Director(director.name, director.id, director.profile_path))
				movieDetailsDto.cast =
																				obj.cast
																					.map(castMember => new CastMember(castMember.name, castMember.id, castMember.character, castMember.profile_path))
				movieCache.put(movieId, movieDetailsDto)
				cb(null, movieDetailsDto)
			})
		})
	}

	function getActorDetails(actorId, cb) {
		const pathToActorPersonalInfo = `https://api.themoviedb.org/3/person/${actorId}?api_key=${apiKey}`
		const pathToMovieParticipations = `https://api.themoviedb.org/3/person/${actorId}/movie_credits?api_key=${apiKey}`
		req(pathToActorPersonalInfo, (err, res, data) => {
			console.log('Making a request to ' + pathToActorPersonalInfo + ' and ' + pathToMovieParticipations)
			if (err) return cb(err)
			let obj = JSON.parse(data.toString())
			let actorDetailsDto = new Actor(obj.biography, obj.birthday, obj.deathday, obj.id, obj.name, obj.popularity, obj.profile_path)
			req(pathToMovieParticipations, (err, res, data) => {
				if (err) return cb(err)
				obj = JSON.parse(data.toString())
				actorDetailsDto.filmography = obj.cast.map(item =>
					new MovieListItem(item.title, item.id, item.release_date, item.poster_path, item.vote_average)
				)
				actorCache.put(actorId, actorDetailsDto)
				cb(null, actorDetailsDto)
			})

		})

	}


}
