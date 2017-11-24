'use strict'

const Actor = require('../model/Actor')
const CastMember = require('../model/CastMember')
const Director = require('../model/Director')
const Movie = require('../model/Movie')
const MovieListItem = require('../model/MovieListItem')
const MovieList = require('../model/MovieList')
const User = require('../model/User')


module.exports = {
	mapToActor,
	mapToCastMember,
	mapToDirector,
	mapToMovie,
	mapToMovieList,
	mapToFilmography,
	mapToUser
}

function mapToMovieList(movieList, query) {
	return new MovieList(
		query,
		movieList.results.map(item => new MovieListItem(item.title, item.id, item.release_date, item.poster_path, item.vote_average)),
		movieList.page,
		movieList.total_pages,
		movieList.total_results
	)
}

function mapToUser(username, password, fullName, email, body) {
	return new User(
		username,
		password,
		fullName,
		email,
		body.rev,
		body.id
	)
}

function mapToFilmography(movieList) {
	return movieList.map(item => new MovieListItem(item.title, item.id, item.release_date, item.poster_path, item.vote_average))
}

function mapToMovie(obj) {
	return new Movie(obj.tagline, obj.id, obj.original_title, obj.overview, obj.release_date, obj.vote_average, obj.poster_path, obj.genres.map(item => item.name).join(' / '))
}

function mapToDirector(crew) {
	return crew
		.filter(crewMember => crewMember.job === 'Director')
		.map(director => new Director(director.name, director.id, director.profile_path))
}

function mapToCastMember(cast) {
	return 	cast.map(castMember => new CastMember(castMember.name, castMember.id, castMember.character, castMember.profile_path))
}

function mapToActor(obj) {
	return new Actor(obj.biography, obj.birthday, obj.deathday, obj.id, obj.name, obj.popularity, obj.profile_path)
}