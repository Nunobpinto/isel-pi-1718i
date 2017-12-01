'use strict'

const fs = require('fs')

const listService = require('../domain/service/userListService')(reqToFile)
const User = require('../domain/model/User')
const List = require('../domain/model/UserList')

const endpoints = {
	DELETE: {
		'http://127.0.0.1:5984/lists/123': fs.readFileSync('./test/files/deleteListResp.json').toString()
	},
	POST: {
		'http://127.0.0.1:5984/lists/_all_docs?include_docs=true': fs.readFileSync('./test/files/getListsByUser.json').toString(),
		'http://127.0.0.1:5984/lists/': fs.readFileSync('./test/files/createListResp.json').toString()
	},
	PUT: {
		'http://127.0.0.1:5984/users/bruno': fs.readFileSync('./test/files/putListInUserResp.json').toString(),
		'http://127.0.0.1:5984/lists/123': fs.readFileSync('./test/files/addMovieToList.json').toString()
	},
	GET: {
		'http://127.0.0.1:5984/lists/123': fs.readFileSync('./test/files/getListResp.json').toString()
	}
}

function reqToFile(options, cb) {
	let data = endpoints[options.method][options.uri]
	if (!data) return cb(new Error(`No mock file for ${options.method} ${options.uri}`))
	data = JSON.parse(data)
	cb(null, data.res, data.body)
}

function testCreateList(test) {
	const user = new User('bruno', 'test', 'Bruno Filipe', 'bruno@email.com', [], 111)
	listService.createList('Italian Movies', 'The best out there', user, (err, list) => {
		if (err)
			test.ifError(err)
		else {
			test.equal(list.description, 'The best out there')
			test.equal(list.id, undefined)
			test.equal(list.items.length, 0)
			test.equal(list.name, 'Italian Movies')
			test.equal(list._rev, '1-123123')
		}
		test.done()
	})
}

function testGetListById(test) {
	listService.getListById(123, (err, list) => {
		if (err)
			test.ifError(err)
		else {
			test.equal(list.id, '123')
			test.equal(list.name, 'Italian Movies')
			test.equal(list.description, 'The best movies')
			test.equal(list.items.length, 0)
			test.equal(list._rev, '123123')
		}
		test.done()
	})
}

function testGetListsByUser(test) {
	listService.getListsByUser(['4a5cd144a1789249096663c6f000196d', '4a5cd144a1789249096663c6f00020a4'], (err, lists) => {
		if (err)
			test.ifError(err)
		else {
			test.equal(lists[0].id, '4a5cd144a1789249096663c6f000196d')
			test.equal(lists[0].items.length, undefined)
			test.equal(lists[1].id, '4a5cd144a1789249096663c6f00020a4')
			test.equal(lists[1].items[0].movieId, '299536')
		}
		test.done()
	})
}

function testAddMovieToList(test) {
	listService.addMovieToList(123, '1', 'example.jpg', '10.0', (err) => {
		if (err)
			test.ifError(err)
		test.done()
	})
}

function testDeleteList(test) {
	test.done()
}

function testRemoveMovieFromList(test) {
	test.done()
}

module.exports = {
	testCreateList,
	testGetListById,
	testGetListsByUser,
	testAddMovieToList,
	testDeleteList,
	testRemoveMovieFromList
}