'use strict'

function UserList(name, description, items, rev, id) {
	this.id = id
	this.name = name
	this.description = description
	this.items = items
	this._rev = rev
}

module.exports = UserList