'use strict'

module.exports = User

function User(username, password, email) {
	this.username = username
	this.password = password
	this.email = email
	this.lists = []
}