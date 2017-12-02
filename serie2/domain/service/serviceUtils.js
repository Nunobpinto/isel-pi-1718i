'use strict'

/**
 * Utility functions used in various services
 */


/**
 * Generic options object to provide to an http request, containing its method, uri and request body
 * @returns json object containing info for an HTTP Request
 */
function optionsBuilder() {
	const argNames = ['method', 'uri', 'body']
	let res = { json: true }
	for( let i = 0; i < arguments.length; ++i )
		res[argNames[i]] = arguments[i]
	return res
}


/**
 * Processes asynchronous functions in parallel
 * @param tasks - an array of functions to be executed
 * @param callback (err,[functionResponse])
 */
function parallel(tasks, callback) {
	let responses = []
	let errOccured = false
	let tasksFulfilled = 0
	tasks.forEach((request, i) => {
		request((err, data) => {
			if (errOccured) return
			if (err) {
				errOccured = true
				return callback(err)
			}
			responses[i] = data
			++tasksFulfilled
			if ( tasksFulfilled === tasks.length ) {
				callback(null, responses)
			}
		})
	})
}

module.exports = {
	optionsBuilder,
	parallel
}