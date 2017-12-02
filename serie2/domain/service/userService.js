'use strict'

const global = require('../../global')
const mapper = require('../mapper')
const utils = require('./serviceUtils')
const debug = require('debug')('serie2:userService')

const url = global.couchdb_url + '/users/'

/**
 * Defines req according to dataSource
 * @param dataSource
 */
function init(dataSource) {
	let req
	if( dataSource )
		req = dataSource
	else
		req = require('request')

	return {
		getUser,
		createUser,
		deleteUser,
		findById
	}

	/**
	 * Get user by username and password in order to login
     * @param username
     * @param password
     * @param cb
     */
	function getUser(username, password, cb) {
		debug('Fetching user with id = ' + username)
		req(utils.optionsBuilder('GET', url + username), (err, res, body) => {
			if ( err || res.statusCode === 404 ) return cb( { message: 'Something broke!', statusCode: (res ? res.statusCode : 500) } )
			if( res.statusCode !== 200 ) return cb(null, null, 'Invalid Credentials')
			if( password !== body.password ) return cb(null, null, 'Invalid Credentials')
			cb(null, mapper.mapToUser(body))
		})
	}

	/**
	 * Create user with given params
     * @param username
     * @param password
     * @param fullName
     * @param email
     * @param cb
     */
	function createUser(username, password, fullName, email, cb) {
		debug('Creating user with username = ' + username)
		const json = {
			username,
			password,
			fullName,
			email,
			lists: []
		}
		req(utils.optionsBuilder('PUT', url + username, json), (err, res, body) => {
			if ( err || res.statusCode === 404 ) return cb( { message: 'Something broke!', statusCode: (res ? res.statusCode : 500) } )
			if( res.statusCode === 409 ) return cb(null, null, `Username "${username}" was already taken!`)
			cb(null, mapper.mapToUser({ username, password, fullName, email, lists: [], _rev: body.rev }))
		})
	}

	/**
	 * Delete user received in param
     * @param user
     * @param cb
     */
	function deleteUser(user, cb) {
		debug('Deleting user with id = ' + user.username)
		req(utils.optionsBuilder('DELETE', url + user.username + `?rev=${user._rev}`), (err) => {
			if( err ) return cb(err)
			cb()
		})
	}

	/**
	 * Find the user with de id received in param
     * @param username
     * @param cb
     */
	function findById(username, cb) {
		req(utils.optionsBuilder('GET', url + username), (err, res, body) => {
			if ( err || res.statusCode === 404 ) return cb( { message: 'Something broke!', statusCode: (res ? res.statusCode : 500) } )
			cb(null, mapper.mapToUser(body))
		})
	}
}

module.exports = init

