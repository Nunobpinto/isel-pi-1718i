'use strict'

module.exports = User

function User(username, password, fullName, email) {
	this.username = username
	this.password = password
	this.fullName = fullName
	this.email = email
	this.lists = []
}