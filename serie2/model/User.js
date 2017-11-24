'use strict'

module.exports = User

function User(username, password, fullName, email, _rev, _id) {
	this.username = username
	this.password = password
	this.fullName = fullName
	this.email = email
	this._rev = _rev
	this._id = _id
	this.lists = []
}