'use strict'

//TODO: add documentation
function Comment(text, author, replies, movieId, id) {
	this.id = id
	this.movieId = movieId
	this.author = author
	this.text = text
	this.replies = replies
}

module.exports = Comment