'use strict'

module.exports = User

function User(username, password, fullName) {
	this.username = username
	this.password = password
	this.fullName = fullName
	this.lists = []
}