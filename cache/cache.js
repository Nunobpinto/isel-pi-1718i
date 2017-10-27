'use strict'

module.exports = {
	get,
	put,
	has,
}

let cache = new Map()

function get(key) {
	return cache.get(key)
}

function put(key, value) {
	cache.set(key, value)
}

function has(key) {
	if ( cache.size === 0 || !cache.has(key) )
		return false
	return true
}