'use strict'

/**
 * List of user object
 * @param {string} name
 * @param {string} description
 * @param {string} owner
 * @param {Array<Object>} items - array of movies in this list {movieId, moviePoster, movieRating}
 * @param {string} rev - revision of list in CouchDb
 * @param {string} id - unique identifier created by CouchDb
 * @constructor
 */
function UserList(name, description, owner, items, rev, id) {
	this.id = id
	this.listName = name
	this.listDesc = description
	this.owner = owner
	this.items = items
	this._rev = rev
}

module.exports = UserList