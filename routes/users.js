'use strict'

const express = require('express')
const listService = require('../domain/service/userListService')()
const authValidation = require('./middlewares/validation')
const router = express.Router()

/**
 * Restricts access to this route to only signed in users
 */
router.use(authValidation)

/**
 * Prevents :username from being anything but the current session's username
 */
router.use('/:username' ,function (req, res, next) {
	if(req.user.username !== req.params.username){
		let err = new Error('User Not Found')
		err.status = 404
		return next(err)
	}
	next()
})

/**
 * Shows user profile page
 */
router.get('/:username', function(req, res, next) {
	listService.getListsByUser(req.user.lists, (err, data) => {
		if( err ) return next(err)
		res.render('userInfo', { lists: data })
	})
})

/**
 * Shows lists of a user
 */
router.get('/:userName/lists', function(req, res, next) {
	listService.getListsByUser(req.user.lists, (err, data) => {
		if( err ) return next(err)
		res.render('userLists', { lists: data })
	})
})

/**
 * Shows form to create a new list
 */
router.get('/:username/lists/new', function(req, res) {
	res.render('createNewList')
})

/**
 * Adds newly created list to user, redirects to user lists page
 */
router.post('/:username/lists/new', function(req, res, next) {
	listService.createList(req.body.name, req.body.description, req.user, (err) => {
		if( err ) return next(err)
		res.redirect(`/users/${req.params.username}/lists`)
	})
})

/**
 * Shows specific list
 */
router.get('/:username/lists/:listId', function(req, res, next) {
	listService.getListById(req.params.listId, req.user.username, (err, data) => {
		if( err ) return next(err)
		res.render('userSpecificList', data)
	})
})

/**
 * Adds a movie to a list
 */
router.post('/:username/lists/:listId', function(req, res, next) {
	listService.addMovieToList(
		req.params.listId,
		req.body.movieID,
		(err) => {
			if( err ) return next(err)
			res.sendStatus(200)
		})
})


/**
 * Deletes a list of movies from specific user
 */
router.delete('/:username/lists/:listId',function (req, res, next) {
	listService.removeMovieFromList(
		req.params.listId,
		req.body.movieID,
		(err) => {
			if( err ) return next(err)
			res.sendStatus(200)
		}
	)
})

/**
 * Updates name or description of a specific list
 */
router.put('/:username/lists/:listId', function (req, res, next) {
	listService.updateList(
		req.params.listId,
		req.body.name,
		req.body.description,
		req.user,
		(err) => {
            if (err) return next(err)
				res.redirect(`/users/${req.params.username}/lists`)
        }
	)
})

module.exports = router
