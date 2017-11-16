'use strict'

const fs = require('fs')
const memoize = require('../cache/memoize')
const mapper = require('../service/mapper')

const apiKey = fs.readFileSync('../apikey.txt').toString()

module.exports = init

function init(dataSource) {
	let req
	if (dataSource)
		req = dataSource
	else
		req = require('request')

	const services = {
		getMovieList,
		'getMovieDetails': memoize(getMovieDetails),
		'getActorDetails': memoize(getActorDetails)
	}
	return services

	function getMovieList(name, page, cb) {
		const movieListPath = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(name)}&page=${page}`

		reqAsJson(movieListPath, (err,data)=>{
			if(err) return cb(err)
			let movieList = mapper.mapToMovieList(data, name)
			cb(null, movieList)
		})
	}

	function getMovieDetails(movieId, cb) {
		const movieDetailsPath = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`
		const movieCreditsPath = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`

		let processResponses = function (err, results) {
			if (err) return cb(err)
			let movie = mapper.mapToMovie(results[0])
			movie.directors = mapper.mapToDirector(results[1].crew)
			movie.cast = mapper.mapToCastMember(results[1].cast)
			cb(null, movie)
		}

		let tasks = [
			function (callback) {
				reqAsJson(movieDetailsPath, callback)
			},
			function (callback) {
				reqAsJson(movieCreditsPath, callback)
			}
		]
		parallel(tasks, processResponses)
	}

	function getActorDetails(actorId, cb) {
		const pathToActorPersonalInfo = `https://api.themoviedb.org/3/person/${actorId}?api_key=${apiKey}`
		const pathToMovieParticipations = `https://api.themoviedb.org/3/person/${actorId}/movie_credits?api_key=${apiKey}`

		let processResponses = function (err, results) {
			if (err) return cb(err)
			let actor = mapper.mapToActor(results[0])
			actor.filmography = mapper.mapToFilmography(results[1].cast)
			cb(null, actor)
		}

		let tasks = [
			function (callback) {
				reqAsJson(pathToActorPersonalInfo, callback)
			},
			function (callback) {
				reqAsJson(pathToMovieParticipations, callback)
			}
		]
		parallel(tasks, processResponses)
	}

	function parallel(tasks, callback) {
		let responses = []
		let errOccured = false
		let tasksFulfilled = 0
		tasks.forEach((request, i) => {
			request((err, data) => {
				if (errOccured) return
				if (err) {
					errOccured = true
					return callback(err)
				}
				responses[i] = data
				++tasksFulfilled
				if ( responses.length === tasks.length && tasksFulfilled === tasks.length ) {
					callback(null, responses)
				}
			})
		})
	}

	function reqAsJson(path, callback) {
		req(path, (err, res, data) => {
			console.log('Making a request to ' + path)
			if ( err || res.statusCode !== 200 )
				return callback( { message: 'Something broke!', statusCode: (res ? res.statusCode : 500) } )
			const obj = JSON.parse(data.toString())
			callback(null, obj)
		})
	}
}