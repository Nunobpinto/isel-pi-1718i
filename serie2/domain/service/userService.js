'use strict'

const global = require('../../global')
const mapper = require('../mapper')
const utils = require('./serviceUtils')
const debug = require('debug')('serie2:userService')

const url = global.couchdb_url + '/users/'

function init(dataSource) {
	let req
	if( dataSource )
		req = dataSource
	else
		req = require('request')

	return {
		getUserById,
		createUser,
		deleteUser,
		find
	}

	function getUserById(username, password, cb) {
		debug('Fetching user with id = ' + username)
		req(utils.optionsBuilder('GET', url + username), (err, res, body) => {
			if( err ) return cb(err)
			if( res.statusCode !== 200 ) return cb(null, null, 'Invalid Credentials')
			if( password !== body.password ) return cb(null, null, 'Invalid Credentials')
			cb(null, mapper.mapToUser(body))
		})
	}

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
			if( err ) return cb(err)
			if( res.statusCode === 409 ) return cb(null, null, `Username "${username}" was already taken!`)
			cb(null, mapper.mapToUser({ username, password, fullName, email, lists: [], _rev: body._rev }))
		})
	}

	function deleteUser(user, cb) {
		debug('Deleting user with id = ' + user.username)
		req(utils.optionsBuilder('DELETE', url + user.username, user), (err) => {
			if( err ) return cb(err)
			cb()
		})
	}

	function find(username, cb) {
		req(utils.optionsBuilder('GET', url + username), (err, res, body) => {
			if( err ) return cb(err)
			cb(null, mapper.mapToUser(body))
		})
	}
}

module.exports = init

