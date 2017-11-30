'use strict'

const express = require('express')
const listService = require('../domain/service/userListService')()
const authValidation = require('./middlewares/validation')
const router = express.Router()

router.use(authValidation)

router.get('/:username', function(req, res, next) {
	listService.getListsByUser(req.user.lists, (err, data) => {
		if( err ) return next(err)
		res.render('userInfo', { lists: data })
	})
})

router.get('/:userName/lists', function(req, res, next) {
	listService.getListsByUser(req.user.lists, (err, data) => {
		if( err ) return next(err)
		res.render('userLists', { lists: data })
	})
})

router.get('/:username/lists/new', function(req, res) {
	res.render('createNewList')
})

router.post('/:username/lists/new', function(req, res, next) {
	listService.createList(req.body.name, req.body.description, req.user, (err) => {
		if( err ) return next(err)
		res.redirect(`/users/${req.params.username}/lists`)
	})
})

router.get('/:username/lists/:listId', function(req, res, next) {
	listService.getListById(req.params.listId, (err, data) => {
		if( err ) return next(err)
		res.render('userSpecificList', data)
	})
})

router.post('/:username/lists/:listId', function(req, res, next) {
	listService.addMovieToList(
		req.params.listId,
		req.body.movieID,
		req.body.poster,
		req.body.rating,
		(err) => {
			if( err ) return next(err)
			res.redirect(`/movies/${req.body.movieID}`)
		})
})

module.exports = router
