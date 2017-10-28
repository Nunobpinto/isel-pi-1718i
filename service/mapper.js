'use strict'

const Actor = require('../domain/Actor')
const CastMember = require('../domain/CastMember')
const Director = require('../domain/Director')
const Movie = require('../domain/Movie')
const MovieListItem = require('../domain/MovieListItem')

module.exports = {
	mapToActor,
	mapToCastMember,
	mapToDirector,
	mapToMovie,
	mapToMovieListItem
}

function mapToMovieListItem(movieList) {
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