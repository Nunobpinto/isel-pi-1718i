'use strict'

const fs = require('fs')

const dbUsers = require('../data/userDb.json')
const User = require('../model/User')

module.exports = {
	authenticate,
	register,
	find
}

function find(username, cb) {
	const user = dbUsers.find(item => item.username === username)
	cb(null, user)
}

function register(username, passwd, email, cb) {
	if( dbUsers.some(user => user.username === username) )
		return cb(null, null, `Username "${username}" was already taken!`)
	const user = new User(username, passwd, email)
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

function save() {
	fs.writeFile('./data/userDb.json', JSON.stringify(dbUsers))
}