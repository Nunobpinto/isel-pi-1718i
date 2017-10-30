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
        const movieListPath = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(name)}&page=${page}`
        let requests = [generateReqAsJson(movieListPath)]

        let transfCb = function (jsonMovieList, cb) {
            let movieList = mapper.mapToMovieList(jsonMovieList)
            cb(null, movieList)
        }

        executeParallelRequests(requests, transfCb, cb)
    }

    function getMovieDetails(movieId, cb) {
        const movieDetailsPath = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`
        const movieCreditsPath = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`

        let transfCb = function (movieDetails, movieCredits, cb) {
            let movie = mapper.mapToMovie(movieDetails)
            movie.directors = mapper.mapToDirector(movieCredits.crew)
            movie.cast = mapper.mapToCastMember(movieCredits.cast)
            cb(null, movie)
        }

        let requests = [generateReqAsJson(movieDetailsPath), generateReqAsJson(movieCreditsPath)]
        executeParallelRequests(requests, transfCb, cb)
    }


    function getActorDetails(actorId, cb) {
        const pathToActorPersonalInfo = `https://api.themoviedb.org/3/person/${actorId}?api_key=${apiKey}`
        const pathToMovieParticipations = `https://api.themoviedb.org/3/person/${actorId}/movie_credits?api_key=${apiKey}`

        let transfCb = function (actorDetails, actorFilmography, cb) {
            let actor = mapper.mapToActor(actorDetails)
            actor.filmography = mapper.mapToFilmography(actorFilmography.cast)
            cb(null, actor)
        }

        let requests = [generateReqAsJson(pathToActorPersonalInfo), generateReqAsJson(pathToMovieParticipations)]
        executeParallelRequests(requests, transfCb, cb)
    }

    function executeParallelRequests(requests, processResponses, finalCb) {
        let i = 0
        let responses = []
        requests.forEach(
            request => { request(generateResponseHandler(i++, responses, requests, processResponses, finalCb)) }
        )
    }

    function generateResponseHandler(respPos, responses, requests, processResponses, finalCb) {
        return (err, jsonObj) => {
            if(err) return finalCb(err)
            responses[respPos] = jsonObj
            if ( responses.length === requests.length && responses.hasNoUndefined() ) {
                responses.push(finalCb)
                return processResponses.apply(this, responses)
            }
        }
    }

    function generateReqAsJson(path) {
        return function (deliverResponse) {
            req(path, (err, res, data) => {
                console.log('Making a request to ' + path)
                if(err) return deliverResponse({message: err.message, statusCode: 500})
                deliverResponse(null, JSON.parse(data.toString()))
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
