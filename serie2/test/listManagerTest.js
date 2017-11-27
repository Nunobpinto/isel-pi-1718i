'use strict'

const dbUsers = []
const userService = require('../domain/service/userService')(reqToFile)
const List = require('../domain/model/UserList')

module.exports = {
	testCreateUser,
	testAddList,
	testAddMovieToList
}

function findByUsername(username, body) {
	return (user, idx, array) => {
		if( user.username === username ) {
			array[idx] = body
			return true
		}
		return false
	}
}

function reqToFile(options, cb) {
	const username = options.uri.split('/')[4]
	if( options.method === 'GET' ) {
		const user = dbUsers.find(item => item.username === username)
		return user ? cb(null, { statusCode: 200 }, user) : cb(null, { statusCode: 404 }, null)
	}
	if( options.method === 'PUT' ) {
		if( !dbUsers.find(findByUsername(username, options.json)) )
			dbUsers.push(options.json)
		return cb(null, { statusCode: 200 }, options.json)
	}
	if( options.method === 'DELETE' ) {
		const index = dbUsers.findIndex(user => user.username === username)
		dbUsers.splice(index, 1)
		return cb(null, { statusCode: 200 }, options.json)
	}
	if( options.method === 'POST' ) {
		//TODO
	}
}

function testCreateUser(test) {
	userService.putUser('bruno', 'test', 'Bruno Filipe', 'bruno@email.com', (err, user) => {
		if( err )
			test.ifError(err)
		else {
			test.equal(user.username, 'bruno')
			test.equal(user.password, 'test')
			test.equal(user.fullName, 'Bruno Filipe')
			test.equal(user.email, 'bruno@email.com')
		}
		userService.deleteUser(user, (err) =>{
			if( err )
				test.ifError(err)
		})
		test.done()
	})
}

function testAddList(test) {
	userService.putUser('bruno', 'test', 'Bruno Filipe', 'bruno@email.com', (err, user) => {
		if( err )
			test.ifError(err)
		else {
			const list = new List('testing', 'just for Test')
			userService.putListInUser(user, list, (err) => {
				if( err )
					test.ifError(err)
			})
			test.equal(user.lists[0].name, 'testing')
			test.equal(user.lists[0].description, 'just for Test')
			test.equal(user.lists[0].id, list.id)
		}
		userService.deleteUser(user, (err) =>{
			if( err )
				test.ifError(err)
		})
		test.done()
	})
}

function testAddMovieToList(test) {
	userService.putUser('bruno', 'test', 'Bruno Filipe', 'bruno@email.com', (err, user) => {
		if( err )
			test.ifError(err)
		else {
			const list = new List('testing', 'just for Test')
			userService.putListInUser(user, list, (err) => {
				if( err )
					test.ifError(err)
			})
			userService.updateListOfUser(user, list.id, 1, 'http://testPosterLink.png', 3.2, (err) => {
				if( err )
					test.ifError(err)
			})
			test.equal(user.lists[0].items[0].movieID, 1)
			test.equal(user.lists[0].items[0].poster, 'http://testPosterLink.png')
		}
		userService.deleteUser(user, (err) =>{
			if( err )
				test.ifError(err)
		})
		test.done()
	})
}
