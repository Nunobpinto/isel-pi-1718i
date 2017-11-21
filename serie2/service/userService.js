'use strict'

const fs = require('fs')

const dbUsers = require('../data/userDb.json')
const User = require('../model/User')

module.exports = init

function init(syncFlag) {

	let save
	if(syncFlag)
		save = saveSyncFunction
	else{
		save = saveFunction
	}

	return {
		authenticate,
		register,
		addList,
		addMovieToList,
		find,
		deleteUser,
		deleteListFromUser,
		deleteMovieFromUserList
	}

	function find(username, cb) {
		const user = dbUsers.find(item => item.username === username)
		cb(null, user)
	}

	function register(username, passwd, fullName, cb) {
		if( dbUsers.some(user => user.username === username) )
			return cb(null, null, `Username "${username}" was already taken!`)
		const user = new User(username, passwd, fullName)
		dbUsers.push(user)
		save()
		cb(null, user)
	}

	function authenticate(username, passwd, cb) {
		const user = dbUsers.find(item => item.username === username)
		if(!user) return cb(null, null, `User ${username} does not exist`)
		if(passwd !== user.password) return cb(null, null, 'Invalid password')
		cb(null, user)
	}

	function addList(username,list) {
		const index = dbUsers.findIndex(item => item.username === username)
		dbUsers[index].lists.push(list)
		save()
	}

	function addMovieToList(username, listID, movie) {
		const userIndex = dbUsers.findIndex(item => item.username === username)
		const listIndex = dbUsers[userIndex].lists.findIndex(item => item.id === listID)
		dbUsers[userIndex].lists[listIndex].items.push(movie)
		save()
	}

	function saveSyncFunction() {
		fs.writeFileSync('./data/userDb.json', JSON.stringify(dbUsers))
	}

	function saveFunction() {
		fs.writeFile('./data/userDb.json', JSON.stringify(dbUsers))
	}

	function deleteUser(username) {
		const index = dbUsers.findIndex(item=> item.username === username);
		dbUsers.splice(index, 1)
		save()
	}

	function deleteListFromUser(username, listID) {
		const userIndex = dbUsers.findIndex(item=> item.username === username);
		const listIndex = dbUsers[userIndex].lists.findIndex(item => item.id === listID)
		dbUsers[userIndex].lists.slice(listIndex,1)
		save()
	}

	function deleteMovieFromUserList(username, listID,movieID) {
		const userIndex = dbUsers.findIndex(item=> item.username === username);
		const listIndex = dbUsers[userIndex].lists.findIndex(item => item.id === listID)
		const movieIndex = dbUsers[userIndex].lists[listIndex].items.findIndex(item=> item.movieID === movieID)
		dbUsers[userIndex].lists[listIndex].items.slice(movieIndex,1)
		save()
	}
}

