'use strict'

const fs = require('fs')
const memoize = require('../../cache/memoize')
const mapper = require('../mapper')
const global = require('../../global')
const debug = require('debug')('serie2:tmdbService')
const utils = require('./serviceUtils')

const apiKey = fs.readFileSync('apikey.txt').toString()
const url = global.tmdb_url

function init(dataSource) {
	let req
	if (dataSource)
		req = dataSource
	else
		req = require('request')

	return {
		getMovieList,
		'getMovieDetails': memoize(getMovieDetails),
		'getActorDetails': memoize(getActorDetails)
	}

	function getMovieList(name, page, cb) {
		const movieListPath = url + `/search/movie?api_key=${apiKey}&query=${encodeURIComponent(name)}&page=${page}`

		reqAsJson(movieListPath, (err,data)=>{
			if(err) return cb(err)
			let movieList = mapper.mapToMovieList(data, name)
			cb(null, movieList)
		})
	}

	function getMovieDetails(movieId, cb) {
		const movieDetailsPath = url + `/movie/${movieId}?api_key=${apiKey}`
		const movieCreditsPath = url + `/movie/${movieId}/credits?api_key=${apiKey}`

		const processResponses = function (err, results) {
			if (err) return cb(err)
			let movie = mapper.mapToMovie(results[0])
			movie.directors = mapper.mapToDirector(results[1].crew)
			movie.cast = mapper.mapToCastMember(results[1].cast)
			cb(null, movie)
		}

		const tasks = [
			function (callback) {
				reqAsJson(movieDetailsPath, callback)
			},
			function (callback) {
				reqAsJson(movieCreditsPath, callback)
			}
		]
		utils.parallel(tasks, processResponses)
	}

	function getActorDetails(actorId, cb) {
		const pathToActorPersonalInfo = url + `/person/${actorId}?api_key=${apiKey}`
		const pathToMovieParticipations = url + `/person/${actorId}/movie_credits?api_key=${apiKey}`

		const processResponses = function (err, results) {
			if (err) return cb(err)
			let actor = mapper.mapToActor(results[0])
			actor.filmography = mapper.mapToFilmography(results[1].cast)
			cb(null, actor)
		}

		const tasks = [
			function (callback) {
				reqAsJson(pathToActorPersonalInfo, callback)
			},
			function (callback) {
				reqAsJson(pathToMovieParticipations, callback)
			}
		]
		utils.parallel(tasks, processResponses)
	}

	function reqAsJson(path, callback) {
		req(path, (err, res, data) => {
			debug('Making a request to ' + path)
			if ( err || res.statusCode !== 200 )
				return callback( { message: 'Something broke!', statusCode: (res ? res.statusCode : 500) } )
			const obj = JSON.parse(data.toString())
			callback(null, obj)
		})
	}
}

module.exports = init