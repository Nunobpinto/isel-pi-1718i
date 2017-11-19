'use strict'

const app = require('express')
const router = app.Router()
const userService = require('../service/userService')
const passport = require('passport')

router.get('/login',function (req, res, next) {
	res.render('login')
})

router.post('/login', function (req, res, next) {
	userService.authenticate(req.body.username, req.body.password, (err, user, info) => {
		if(err) return next(err)
		if(info) return next(new Error(info))
		req.logIn(user, (err) => {
			if(err) return next(err)
			res.redirect('/home')
		})
	})
})

router.get('/signup', function (req, res, next) {
	res.render('signup')
})

router.post('/signup', function (req, res, next) {
	userService.register(req.body.username, req.body.password, (err, user, info) => {
		if(err) return next(err)
		if(info) return next(new Error(info))
		req.logIn(user, (err) => {
			if(err) return next(err)
			res.redirect('/leagues')
		})
	})
	res.redirect('/home')
})

router.use((req, res, next) => {
	if(req.user) res.locals.favourites = req.user.lists
	else res.locals.favourites = []
	next()
})

passport.serializeUser(function(user, cb) {
	cb(null, user.username)
})

passport.deserializeUser(function(username, cb) {
	userService.find(username, cb)
})

module.exports = router