'use strict'

const fs = require('fs')
const actorCache = require('../cache/cache')
const movieCache = require('../cache/cache')
const memoize = require('../cache/memoize')
const mapper = require('../service/mapper')

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

	function getMovieList(name,page,cb) {

		const movieListPath = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(name)}&page=${page}`
		req(movieListPath, (err, res, data) => {
			console.log('Making a request to ' + movieListPath)
			if (err) return cb({message: err.message, statusCode: 500})
			const obj = JSON.parse(data.toString())
			if (obj.hasOwnProperty('errors'))
				return cb({message: obj.errors[0], statusCode: res.statusCode})
			let movieListDto = mapper.mapToMovieList(obj, name)
			cb(null, movieListDto)
		})
	}

	function getMovieDetails(movieId, cb) {
		/*
		const movieDetailsPath = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`
		const movieCreditsPath = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`
		req(movieDetailsPath, (err, res, data) => {
			console.log('Making a request to ' + movieDetailsPath + ' and ' + movieCreditsPath)
			if (err) return cb(err)
			let obj = JSON.parse(data.toString())
			let movieDetailsDto = mapper.mapToMovie(obj)
			req(movieCreditsPath, (err, res, data) => {
				if (err) return cb(err)
				obj = JSON.parse(data.toString())
				movieDetailsDto.directors = mapper.mapToDirector(obj.crew)
				movieDetailsDto.cast = mapper.mapToCastMember(obj.cast)
				movieCache.put(movieId, movieDetailsDto)
				cb(null, movieDetailsDto)
			})
		})*/
        const movieDetailsPath = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`
        const movieCreditsPath = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`
        let fn1 = function (func) {
            req(movieDetailsPath, (err, res, data) => {
                    console.log('Making a request to ' + movieDetailsPath + ' and ' + movieCreditsPath)
                    if (err) return cb(err)
                    let obj = JSON.parse(data.toString())
                    let movieDetailsDto = mapper.mapToMovie(obj)
					func(movieDetailsDto)
                }
            )
        }
        let fn2 = function (func) {
            req(movieCreditsPath, (err, res, data) => {
                if (err) return cb(err)
                let obj = JSON.parse(data.toString())
                func(obj)
            })
        }


        let transfCb = function (movieDetails, obj,cb) {
            movieDetails.directors = mapper.mapToDirector(obj.crew)
            movieDetails.cast = mapper.mapToCastMember(obj.cast)
            movieCache.put(movieId, movieDetails)
            cb(null, movieDetails)
        }

        let fnArrays = [fn1,fn2]
        parallelRequests(fnArrays,transfCb,cb)
    }


	function getActorDetails(actorId, cb) {
		/*const pathToActorPersonalInfo = `https://api.themoviedb.org/3/person/${actorId}?api_key=${apiKey}`
		const pathToMovieParticipations = `https://api.themoviedb.org/3/person/${actorId}/movie_credits?api_key=${apiKey}`
		req(pathToActorPersonalInfo, (err, res, data) => {
			console.log('Making a request to ' + pathToActorPersonalInfo + ' and ' + pathToMovieParticipations)
			if (err) return cb(err)
			let obj = JSON.parse(data.toString())
			let actorDetailsDto = mapper.mapToActor(obj)
			req(pathToMovieParticipations, (err, res, data) => {
				if (err) return cb(err)
				obj = JSON.parse(data.toString())
				actorDetailsDto.filmography = mapper.mapToFilmography(obj.cast)
				actorCache.put(actorId, actorDetailsDto)
				cb(null, actorDetailsDto)
			})

		})
*/
		const pathToActorPersonalInfo = `https://api.themoviedb.org/3/person/${actorId}?api_key=${apiKey}`
        const pathToMovieParticipations = `https://api.themoviedb.org/3/person/${actorId}/movie_credits?api_key=${apiKey}`

        let fn1 = function (func) {
                req(pathToActorPersonalInfo, (err, res, data) => {
                        console.log('Making a request to ' + pathToActorPersonalInfo + ' and ' + pathToMovieParticipations)
                        if (err) return cb(err)
                        let obj = JSON.parse(data.toString())
                        let actorDetailsDto = mapper.mapToActor(obj)
                        func(actorDetailsDto)
                    }
                )
		}
        let fn2 = function (func) {
            	req(pathToMovieParticipations, (err, res, data) => {
                    if (err) return cb(err)
                    let obj = JSON.parse(data.toString())
                    func(obj)
                })
            }


        let transfCb = function (actorDetails, obj,cb) {
            actorDetails.filmography = mapper.mapToFilmography(obj.cast)
            actorCache.put(actorId, actorDetails)
			cb(null,actorDetails)
        }

        let fnArrays = [fn1,fn2]
        parallelRequests(fnArrays,transfCb,cb)
	}

    function parallelRequests(fnArrays,transformerCb, finalCb) {
        let res = []
        fnArrays.forEach(
            fn => {
                fn((data) => {
                        res.push(data)
                        if (res.length === fnArrays.length) {
                            res.push(finalCb)
                            return transformerCb.apply(this, res)
                        }
                    }
                )
            }
        )
    }

}
