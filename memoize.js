'use strict'

module.exports = memoize

function memoize(fn,cache) {
	return (key,cb)=>{
		if ( cache.has(key) ) {
			console.log('Accessing cache with key ' + key)
			return cb(null, cache.get(key))
		}
		fn(key,cb)
	}
}
