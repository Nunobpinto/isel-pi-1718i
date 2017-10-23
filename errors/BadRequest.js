'use strict'

module.exports = BadRequest

function BadRequest(message) {
	this.statusCode = 404
	this.message = message
}