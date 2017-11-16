'use strict'
const Cache = require('./cache')

module.exports = memoize

function memoize(fn) {
	const cache = new Cache()
	return (key,cb)=>{
		if ( cache.has(key) ) {
			console.log('Accessing cache with key ' + key)
			return cb(null, cache.get(key))
		}
		fn(key, (err, data) => {
			if(err) return cb(err)
			cache.put(key, data)
			cb(null, data)
		})
	}
}
