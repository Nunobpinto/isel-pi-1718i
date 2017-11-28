'use strict'

const global = require('../../global')
const mapper = require('../mapper')

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
		const options = {
			method: 'GET',
			uri: url + username,
		}
		req(options, (err, res, body) => {
			if( err ) return cb(err)
			if( res.statusCode !== 200 ) return cb(null, null, 'Invalid Credentials')
			const jsonUser = JSON.parse(body)
			if( password !== jsonUser.password ) return cb(null, null, 'Invalid Credentials')
			cb(null, mapper.mapToUser(jsonUser))
		})
	}

	function createUser(username, password, fullName, email, cb) {
		const options = {
			method: 'PUT',
			uri: url + username,
			json: {
				username,
				password,
				fullName,
				email,
				lists: []
			}
		}
		req(options, (err, res, body) => {
			if( err ) return cb(err)
			if( res.statusCode === 409 ) return cb(null, null, `Username "${username}" was already taken!`)
			cb(null, mapper.mapToUser(body))
		})
	}

	function deleteUser(user, cb) {
		const options = {
			method: 'DELETE',
			uri: url + user.username,
			json: user
		}
		req(options, (err) => {
			if( err ) return cb(err)
			cb()
		})
	}

	function find(username, cb) {
		const options = {
			method: 'GET',
			uri: url + username,
		}
		req(options, (err, res, body) => {
			if( err ) return cb(err)
			cb(null, mapper.mapToUser(JSON.parse(body)))
		})
	}
}

module.exports = init

