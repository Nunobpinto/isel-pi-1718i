'use strict'

function UserList(name, description, owner, items, rev, id) {
	this.id = id
	this.name = name
	this.description = description
	this.owner = owner
	this.items = items
	this._rev = rev
}

module.exports = UserList