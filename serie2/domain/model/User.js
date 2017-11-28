'use strict'

function User(username, password, fullName, email, lists, rev) {
	this.username = username
	this.password = password
	this.fullName = fullName
	this.email = email
	this.lists = lists
	this.rev = rev
}

module.exports = User