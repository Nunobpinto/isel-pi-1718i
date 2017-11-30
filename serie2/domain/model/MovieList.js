'use strict'

function MovieList(query, results, currentPage, totalPages, totalResults) {
	this.query = query
	this.results = results
	this.currentPage = currentPage
	this.totalPages = totalPages
	this.totalResults = totalResults
}

module.exports = MovieList