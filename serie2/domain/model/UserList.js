'use strict'

function UserList(name, description, items, rev) {
	this.name = name
	this.description = description
	this.items = items
	this._rev = rev
}

module.exports = UserList