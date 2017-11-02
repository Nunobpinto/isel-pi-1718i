'use strict'

const fs = require('fs')
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
        'getMovieDetails': memoize(getMovieDetails),
        'getActorDetails': memoize(getActorDetails)
    }
    return services

    function getMovieList(name, page, cb) {
        if (name === '')
            return cb({message: 'Query must be provided', statusCode: 404})
        const movieListPath = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(name)}&page=${page}`
        req(movieListPath, (err, res, data) => {
            console.log('Making a request to ' + movieListPath)
            if (err) return cb({message: err.message, statusCode: 500})
            const obj = JSON.parse(data.toString())
            let movieList = mapper.mapToMovieList(obj, name)
            cb(null, movieList)
        })
    }

    function getMovieDetails(movieId, cb) {
        const movieDetailsPath = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`
        const movieCreditsPath = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`

        let processResponses = function (err, results) {
            if (err)
                return cb(err)
            let movie = mapper.mapToMovie(results[0])
            movie.directors = mapper.mapToDirector(results[1].crew)
            movie.cast = mapper.mapToCastMember(results[1].cast)
            cb(null, movie)
        }

        let requests = [
            function (callback) {
                req(movieDetailsPath, (err, res, data) => {
                    console.log('Making a request to ' + movieDetailsPath)
                    if (err) return callback({message: err.message, statusCode: 500})
                    const obj = JSON.parse(data.toString())
                    callback(null, obj)
                })
            },
            function (callback) {
                req(movieCreditsPath, (err, res, data) => {
                    console.log('Making a request to ' + movieCreditsPath)
                    if (err) return callback({message: err.message, statusCode: 500})
                    const obj = JSON.parse(data.toString())
                    callback(null, obj)
                })
            }
        ]
        parallel(requests, processResponses)
    }


    function getActorDetails(actorId, cb) {
        const pathToActorPersonalInfo = `https://api.themoviedb.org/3/person/${actorId}?api_key=${apiKey}`
        const pathToMovieParticipations = `https://api.themoviedb.org/3/person/${actorId}/movie_credits?api_key=${apiKey}`

        let processResponses = function (err, results) {
            if (err)
                return cb(err)
            let actor = mapper.mapToActor(results[0])
            actor.filmography = mapper.mapToFilmography(results[1].cast)
            cb(null, actor)
        }

        let tasks = [
            function (callback) {
                req(pathToActorPersonalInfo, (err, res, data) => {
                    console.log('Making a request to ' + pathToActorPersonalInfo)
                    if (err) return callback({message: err.message, statusCode: 500})
                    const obj = JSON.parse(data.toString())
                    callback(null, obj)
                })
            },
            function (callback) {
                req(pathToMovieParticipations, (err, res, data) => {
                    console.log('Making a request to ' + pathToMovieParticipations)
                    if (err) return callback({message: err.message, statusCode: 500})
                    const obj = JSON.parse(data.toString())
                    callback(null, obj)
                })
            }
        ]
        parallel(tasks, processResponses)
    }

    function parallel(tasks, processResponses) {
        let responses = []
        tasks.forEach((request, i) => {
            request((err, data) => {
                if (err)
                    return processResponses(err)
                responses[i] = data
                if (responses.length === tasks.length && responses.hasNoUndefined()) {
                    processResponses(null, responses)
                }
            })
        })
    }
}

Array.prototype.hasNoUndefined = function () {
    for (let i = 0; i < this.length; ++i) {
        if (this[i] === undefined)
            return false
    }
    return true
}
