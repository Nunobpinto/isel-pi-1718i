'use strict'

const express = require('express')
const listService = require('../domain/service/userListService')()
const commentService = require('../domain/service/commentService')()
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
	res.render('userInfo')
})

/**
 * Shows lists of a user
 */
router.get('/:userName/lists', function(req, res, next) {
	let page = req.query['page']
	if(!page) page = '1'
	listService.getListsByUserPaginated(req.user.lists, page, (err, data) => {
		if( err ) return next(err)
		let totalPages = Math.ceil(data.rows / 4)
		res.render('userLists', { lists: data.lists, currentPage: parseInt(page), totalPages: totalPages })
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
 * Deletes a movie from specific list
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
 * Deletes a list with the specified id
 */
router.delete('/:username/lists', function (req, res, next) {
	const listId = req.body.listID
	listService.deleteList(listId, req.user, err => {
		if(err) return next(err)
		res.sendStatus(200)
	})
})

/**
 * Updates name or description of a specific list
 */
router.put('/:username/lists/:listId', function (req, res, next) {
	listService.updateList(
		req.params.listId,
		req.body.name,
		req.body.description,
		req.params.username,
		(err) => {
			if (err) return next(err)
			res.sendStatus(200)
		}
	)
})

/**
 * Get comments written by a user
 */
router.get('/:username/comments', function(req, res, next) {
	commentService.getCommentsByUser(req.user.username, req.user.commentedOn, (err, comments) => {
		if( err ) return next(err)
		res.render('userComments', { comments: comments })
	})
})

module.exports = router
