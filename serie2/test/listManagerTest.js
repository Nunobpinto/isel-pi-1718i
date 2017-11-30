'use strict'

const fs = require('fs')

const listService = require('../domain/service/userListService')(reqToFile)
const User = require('../domain/model/User')
const List = require('../domain/model/UserList')

const endpoints = {
	DELETE: {
		'http://127.0.0.1:5984/lists/123': fs.readFileSync('')
	},
	POST: {
		'http://127.0.0.1:5984/lists/_all_docs?include_docs=true': fs.readFileSync(''),
		'http://127.0.0.1:5984/lists/': fs.readFileSync('./test/files/createListResp')
	},
	PUT: {
		'http://127.0.0.1:5984/users/nuno': fs.readFileSync('./test/files/putListInUserResp')
	},
	GET: {
		'http://127.0.0.1:5984/lists/123': fs.readFileSync('./test/files/getListResp')
	}
}

function reqToFile(options, cb) {
	const data = endpoints[options.method][options.uri]
	if( !data ) return cb(new Error(`No mock file for ${options.method} ${options.uri}`))
	cb(null, data.res, data.body)
}

function testCreateList(test) {
	const user = new User('bruno', 'test', 'Bruno Filipe', 'bruno@email.com', [], 111)
	listService.createList('Italian Movies', 'The best out there', user, (err, list) => {
		if( err )
			test.ifError(err)
		else {
			test.equal(user.lists[0], 123)
			test.equal(list.id, 123)
			test.equal(list.name, 'Italian Movies')
			test.equal(list.description, 'The best out there')
			test.equal(list.items, [])
			test.equal(list._rev, 123123)
		}
		test.done()
	})
}

function testGetListById(test) {
	listService.getListById(123, (err, list) => {
		if( err )
			test.ifError(err)
		else {
			test.equal(list.id, 123)
			test.equal(list.name, 'Italian Movies')
			test.equal(list.description, '')
			test.equal(list.items, [])
			test.equal(list._rev, 123123)
		}
	})
}

function testGetListsByUser(test) {
	//TODO
}

function testAddMovieToList(test) {
	//TODO
}

function testDeleteList(test) {
	//TODO
}

function testRemoveMovieFromList(test) {
	//TODO
}

module.exports = {
	testCreateList,
	testGetListById,
	testGetListsByUser,
	testAddMovieToList,
	testDeleteList,
	testRemoveMovieFromList
}