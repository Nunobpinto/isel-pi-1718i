'use strict'

const Cache = require('./cache')
const debug = require('debug')('serie2:memoize')

module.exports = function memoize(fn) {
	const cache = new Cache()
	return (key,cb)=>{
		if ( cache.has(key) ) {
			debug('Accessing cache with key ' + key)
			return cb(null, cache.get(key))
		}
		fn(key, (err, data) => {
			if(err) return cb(err)
			cache.put(key, data)
			cb(null, data)
		})
	}
}