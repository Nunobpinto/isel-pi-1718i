'use strict'

//TODO: add documentation
function Comment(id, movieId, movieName, author, text, replies) {
	this.id = id
	this.movieId = movieId
	this.movieName = movieName
	this.author = author
	this.text = text
	this.replies = replies
}

module.exports = Comment