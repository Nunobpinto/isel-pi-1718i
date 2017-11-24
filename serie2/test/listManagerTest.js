'use strict'

const fs = require('fs')

const dbUsers = require('../data/userDb.json')
const userService = require('../service/userService')(reqToFile)
const List = require('../model/UserList')

module.exports = {
	testCreateUser,
	testAddList,
	testAddMovieToList
}

function reqToFile(options, cb) {
	const username = options.uri.split('/')[4]
	if( options.method === 'GET' ) {
		const user = dbUsers.find(item => item.username === username)
		return user ? cb(null, { statusCode: 200 }, user) : cb(null, { statusCode: 404 }, null)
	}
	if( options.method === 'PUT' ) {
		dbUsers.find((user, idx, array) => {
			if( user.username === username ) {
				array[idx] = options.body
				fs.writeFile('./data/userDb.json', JSON.stringify(dbUsers))
				return true
			}
			return false
		})
		return cb(null, { statusCode: 200 }, options.body)
	}
	if( options.method === 'DELETE' ) {
		const index = dbUsers.findIndex(user => user.username === username)
		dbUsers.splice(index, 1)
		fs.writeFile('./data/userDb.json', JSON.stringify(dbUsers))
		return cb(null, { statusCode: 200 }, options.body)
	}
	if( options.method === 'POST' ) {
		//TODO
	}
}

function testCreateUser(test) {
	userService.register('bruno', 'test', 'Bruno Filipe', (err, user) => {
		if( err )
			test.ifError(err)
		else {
			test.equal(user.username, 'bruno')
			test.equal(user.password, 'test')
			test.equal(user.fullName, 'Bruno Filipe')
		}
		userService.deleteUser('bruno')
		test.done()
	})
}

function testAddList(test) {
	userService.register('bruno', 'test', 'Bruno Filipe', (err, user) => {
		if( err )
			test.ifError(err)
		else {
			const list = new List('testing', 'just for Test')
			userService.addList(user.username, list)
			test.equal(user.lists[0].name, 'testing')
			test.equal(user.lists[0].description, 'just for Test')
		}
		userService.deleteUser('bruno')
		test.done()
	})
}

function testAddMovieToList(test) {
	userService.register('bruno', 'test', 'Bruno Filipe', (err, user) => {
		if( err )
			test.ifError(err)
		else {
			const list = new List('testing', 'just for Test')
			userService.addList(user.username, list)
			const movie = {
				movieID: 1,
				title: 'Movie Test'
			}
			userService.addMovieToList(user.username, list.id, movie)
			test.equal(user.lists[0].items[0].movieID, 1)
			test.equal(user.lists[0].items[0].title, 'Movie Test')
		}
		userService.deleteUser('bruno')
		test.done()
	})
}
