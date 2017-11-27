'use strict'

const app = require('express')
const router = app.Router()
const userService = require('../domain/service/userService')()
const passport = require('passport')

router.get('/signin',function (req, res) {
	res.render('signin')
})

router.post('/signin', function (req, res, next) {
	userService.getUser(req.body.username, req.body.password, (err, user, info) => {
		if(err) return next(err)
		if(info) return next(new Error(info))
		req.logIn(user, (err) => {
			if(err) return next(err)
			res.redirect('/home')
		})
	})
})

router.get('/register', function (req, res) {
	res.render('register')
})

router.post('/register', function (req, res, next) {
	userService.putUser(req.body.username, req.body.password, req.body.fullName, req.body.email, (err, user, info) => {
		if(err) return next(err)
		if(info) return next(new Error(info))
		req.logIn(user, (err) => {
			if(err) return next(err)
			res.redirect('/home')
		})
	})
})

router.get('/signout',function (req, res) {
	req.logout()
	res.redirect('/home')
})

passport.serializeUser(function(user, cb) {
	cb(null, user.username)
})

passport.deserializeUser(function(username, cb) {
	userService.findUser(username, cb)
})

module.exports = router