'use strict'

const shortID = require('shortid')

module.exports = UserList

function UserList(name, description) {
	this.id = shortID.generate()
	this.name = name
	this.description = description
	this.items = []
}