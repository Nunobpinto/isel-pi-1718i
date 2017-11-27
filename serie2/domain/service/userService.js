'use strict'

const coimaDbURI = 'http://127.0.0.1:5984/coimadb'
const mapper = require('../mapper')

function init(dataSource) {
	let req
	if( dataSource )
		req = dataSource
	else
		req = require('request')

	return {
		findUser,
		getUser,
		putUser,
		putListInUser,
		updateListOfUser,
		deleteUser,
		//deleteListFromUser,
		//deleteMovieFromUserList
	}

	function findUser(username, cb) {
		const options = {
			method: 'GET',
			uri: coimaDbURI + '/' + username,
		}
		req(options, (err, res, body) => {
			if( err ) return cb(err)
			cb(null, JSON.parse(body))
		})
	}

	function putUser(username, password, fullName, email, cb) {
		const options = {
			method: 'PUT',
			uri: coimaDbURI + '/' + username,
			json: { username, password, fullName, email, lists: [] }
		}
		req(options, (err, res, body) => {
			if( err ) return cb(err)
			if( res.statusCode === 409 ) return cb(null, null, `Username "${username}" was already taken!`)
			const user = mapper.mapToUser(username, password, fullName, email, body)
			cb(null, user)
		})
	}

	function getUser(username, password, cb) {
		const options = {
			method: 'GET',
			uri: coimaDbURI + '/' + username,
		}
		req(options, (err, res, body) => {
			if( err ) return cb(err)
			if( res.statusCode !== 200 ) return cb(null, null, 'Invalid Credentials')
			const user = JSON.parse(body)
			if( password !== user.password ) return cb(null, null, 'Invalid Credentials')
			cb(null, user)
		})
	}

	function putListInUser(user, newList, cb) {
		user.lists.push(newList)
		const options = {
			method: 'PUT',
			uri: coimaDbURI + '/' + user.username,
			json: user
		}
		req(options, (err) => {
			if( err ) return cb(err)
			cb()
		})
	}

	//TODO: constroi-se o filme dentro ou fora do serviço
	function updateListOfUser(user, listID, movieID, poster, voteAverage, cb) {
		const movie = {
			movieID,
			poster,
			voteAverage
		}
		user.lists.find((list, idx, array) => {
			if( list.id === listID ) {
				array[idx].items.push(movie)
				return true
			}
			return false
		})
		const options = {
			method: 'PUT',
			uri: coimaDbURI + '/' + user.username,
			json: user
		}
		req(options, (err, res, body) => {
			if( err ) return cb(err)
			cb()
		})
	}

	function deleteUser(user, cb) {
		const options = {
			method: 'DELETE',
			uri: coimaDbURI + '/' + user.username,
			json: user
		}
		req(options, (err, res, body) => {
			if( err ) return cb(err)
			cb()
		})
	}
/*
	function deleteListFromUser(user, listID) {
		const listIndex = user.lists.findIndex(item => item.id === listID)
		user.lists.slice(listIndex, 1)
		const options = {
			method: 'PUT',
			uri: coimaDbURI + '/' + user.username,
			json: user
		}
		req(options, (err, res, body) => {
			if( err ) return cb(err)
			cb()
		})
	}

	function deleteMovieFromUserList(user, listID, movieID) {
		const listIndex = user.lists.findIndex(item => item.id === listID)
		const movieIndex = user.lists[listIndex].items.findIndex(item => item.movieID === movieID)
		user.lists[listIndex].items.slice(movieIndex, 1)
		const options = {
			method: 'PUT',
			uri: coimaDbURI + '/' + user.username,
			json: user
		}
		req(options, (err, res, body) => {
			if( err ) return cb(err)
			cb()
		})
	}
*/
}

module.exports = init

