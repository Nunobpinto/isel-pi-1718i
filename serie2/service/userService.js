'use strict'

//const fs = require('fs')
//const dbUsers = require('../data/userDb.json')
const coimaDbURI = 'http://127.0.0.1:5984/coimadb'
const mapper = require('../service/mapper')

function init(dataSource) {
	let req
	if( dataSource )
		req = dataSource
	else
		req = require('request')

	return {
		authenticate: getUser,
		register: putUser,
		addList: putListInUser,
		addMovieToList: updateListOfUser,
		find/*,
		deleteUser,
		deleteListFromUser,
		deleteMovieFromUserList*/
	}

	function find(username, cb) {
		const options = {
			method: 'GET',
			uri: coimaDbURI + '/' + username,
		}
		req(options, (err, res, body) => {
			if( err ) return cb(err)
			cb(null, JSON.parse(body))
		})
		//const user = dbUsersURI.find(item => item.username === username)
		//cb(null, user)
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
			if( res.statusCode !== 200 ) return cb(null, null, `User ${username} does not exists`)
			const user = JSON.parse(body)
			if( password !== user.password ) return cb(null, null, 'Invalid password')
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
		req(options, (err, res, body) => {
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
		/*
		const userIndex = coimaDbURI.findIndex(item => item.username === username)
		const listIndex = coimaDbURI[userIndex].lists.findIndex(item => item.id === listID)
		coimaDbURI[userIndex].lists[listIndex].items.push(movie)
		save()*/
	}

	/*
	function saveSyncFunction() {
		fs.writeFileSync('./data/userDb.json', JSON.stringify(coimaDbURI))
	}

	function saveFunction() {
		fs.writeFile('./data/userDb.json', JSON.stringify(coimaDbURI))
	}

	function deleteUser(username) {
		const index = coimaDbURI.findIndex(item => item.username === username)
		coimaDbURI.splice(index, 1)
		save()
	}

	function deleteListFromUser(username, listID) {
		const userIndex = coimaDbURI.findIndex(item => item.username === username)
		const listIndex = coimaDbURI[userIndex].lists.findIndex(item => item.id === listID)
		coimaDbURI[userIndex].lists.slice(listIndex, 1)
		save()
	}

	function deleteMovieFromUserList(username, listID, movieID) {
		const userIndex = coimaDbURI.findIndex(item => item.username === username)
		const listIndex = coimaDbURI[userIndex].lists.findIndex(item => item.id === listID)
		const movieIndex = coimaDbURI[userIndex].lists[listIndex].items.findIndex(item => item.movieID === movieID)
		coimaDbURI[userIndex].lists[listIndex].items.slice(movieIndex, 1)
		save()
	}
	*/
}

module.exports = init

