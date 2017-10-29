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
        'getMovieDetails': memoize(getMovieDetails, movieCache),
        'getActorDetails': memoize(getActorDetails, actorCache)
    }
    return services

    function getMovieList(name, page, cb) {
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
        const movieDetailsPath = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`
        const movieCreditsPath = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`

        let transfCb = function (movieDetails, movieCredits, cb) {
            let movie = mapper.mapToMovie(movieDetails)
            movie.directors = mapper.mapToDirector(movieCredits.crew)
            movie.cast = mapper.mapToCastMember(movieCredits.cast)
            movieCache.put(movieId, movie)
            cb(null, movie)
        }

        let requests = [generateParallelRequest(movieDetailsPath), generateParallelRequest(movieCreditsPath)]
        executeRequests(requests, transfCb, cb)
    }


    function getActorDetails(actorId, cb) {
        const pathToActorPersonalInfo = `https://api.themoviedb.org/3/person/${actorId}?api_key=${apiKey}`
        const pathToMovieParticipations = `https://api.themoviedb.org/3/person/${actorId}/movie_credits?api_key=${apiKey}`

        let transfCb = function (actorDetails, actorFilmography, cb) {
            let actor = mapper.mapToActor(actorDetails)
            actor.filmography = mapper.mapToFilmography(actorFilmography.cast)
            actorCache.put(actorId, actor)
            cb(null, actor)
        }

        let requests = [generateParallelRequest(pathToActorPersonalInfo), generateParallelRequest(pathToMovieParticipations)]
        executeRequests(requests, transfCb, cb)
    }

    function executeRequests(requests, processResponses, finalCb) {
        let responses = []
        let i = 0
        requests.forEach(
            request => {
                request(
                    i++,
                    (respPos, jsonObj) => {
                        responses[respPos] = jsonObj
                        if ( responses.length === requests.length && responses.hasNoUndefined() ) {
                            responses.push(finalCb)
                            return processResponses.apply(this, responses)
                        }
                    }
                )
            }
        )
    }

    function generateParallelRequest(path) {
        return function (respIndex, deliverResponse) {
            req(path, (err, res, data) => {
                console.log('Making a request to ' + path)
                if(err) return deliverResponse(err)
                deliverResponse(respIndex, JSON.parse(data.toString()))
            })
        }
    }

}

Array.prototype.hasNoUndefined = function () {
    for(let i = 0; i < this.length; ++i) {
        if ( this[i] === undefined )
            return false
    }
    return true
}
