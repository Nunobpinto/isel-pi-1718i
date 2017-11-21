'use strict'

const userService = require('../service/userService')(true)
const List = require('../model/UserList')

module.exports = {
	testCreateUser,
	testAddList,
	testAddMovieToList
}

function testCreateUser(test) {
	userService.register('bruno','test','Bruno Filipe',(err,user)=>{
		if(err)
			test.ifError(err)
		else {
			test.equal(user.username, 'bruno')
			test.equal(user.password, 'test')
			test.equal(user.fullName,'Bruno Filipe')
		}
		userService.deleteUser('bruno')
		test.done()
	})
}

function testAddList(test) {
	userService.register('bruno','test','Bruno Filipe',(err,user)=>{
		if(err)
			test.ifError(err)
		else {
			const list = new List('testing','just for Test')
			userService.addList(user.username,list)
			test.equal(user.lists[0].name,'testing')
			test.equal(user.lists[0].description,'just for Test')
		}
		userService.deleteUser('bruno')
		test.done()
	})
}

function testAddMovieToList(test) {
	userService.register('bruno','test','Bruno Filipe',(err,user)=>{
		if(err)
			test.ifError(err)
		else {
			const list = new List('testing','just for Test')
			userService.addList(user.username,list)
			const movie = {
				movieID : 1,
				title : 'Movie Test'
			}
			userService.addMovieToList(user.username,list.id,movie)
			test.equal(user.lists[0].items[0].movieID,1)
			test.equal(user.lists[0].items[0].title,'Movie Test')
		}
		userService.deleteUser('bruno')
		test.done()
	})
}
