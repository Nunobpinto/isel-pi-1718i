'use strict'

function Director(name, id, portrait) {
	this.name = name
	this.id = id
	this.portrait = portrait
	this.toString = function () {
		return `Name:${name} , Id:${id} , Portrait: ${portrait}`
	}
}

module.exports = Director