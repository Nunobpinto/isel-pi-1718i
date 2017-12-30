'use strict'

const global = require('../../global')
const mapper = require('../mapper')
const utils = require('./serviceUtils')
const debug = require('debug')('LI52D-G11:userService')

const url = global.couchdb_url + '/users/'

/**
 * Obtain data from provided dataSource and manages user interaction with application
 * @param {function} dataSource - repository (local or a Web API)
 * @returns {getUser, createUser, deleteUser, findById}
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
	 * @param {string} username
	 * @param {string} password
	 * @param {function} cb(err, User)
	 */
	function getUser(username, password, cb) {
		debug('Fetching user with id = ' + username)
		findById(username, (err, user, info) => {
			if( err ) return cb(err)
			if( info ) return cb(null, null, info)
			if( password !== user.password ) return cb(null, null, 'Invalid Credentials')
			cb(null, user)
		})
	}

	/**
	 * Create user with given params
	 * @param {string} username
	 * @param {string} password
	 * @param {string} fullName
	 * @param {string} email
	 * @param {function} cb(err, User)
	 */
	function createUser(username, password, fullName, email, cb) {
		debug('Creating user with username = ' + username)
		const json = {
			username,
			password,
			fullName,
			email,
			lists: [],
			commentedOn: []
		}
		req(utils.optionsBuilder(url + username, 'PUT', json), (err, res, body) => {
			if( err ) return cb(err)
			if( res.statusCode === 409 ) return cb(null, null, `Username "${username}" was already taken!`)
			json._rev = body.rev
			cb(null, mapper.mapToUser(json))
		})
	}

	/**
	 * Delete user received in param
	 * @param {User} user
	 * @param {function} cb(err) if successful, no parameters are passed to the callback
	 */
	function deleteUser(user, cb) {
		debug('Deleting user with id = ' + user.username)
		req(utils.optionsBuilder(url + user.username + `?rev=${user._rev}`, 'DELETE'), (err) => {
			if( err ) return cb(err)
			cb()
		})
	}

	/**
	 * Find the user with the given username
	 * @param {string} username
	 * @param {function} cb(err, User)
	 */
	function findById(username, cb) {
		req(utils.optionsBuilder(url + username), (err, res, body) => {
			if( err ) return cb(err)
			if( res.statusCode !== 200 ) return cb(null, null, 'Invalid Credentials')
			cb(null, mapper.mapToUser(body))
		})
	}
}

module.exports = init

