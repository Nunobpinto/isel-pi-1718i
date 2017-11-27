'use strict'

const express = require('express')
const router = express.Router()

const List = require('../domain/model/UserList')
const userService = require('../domain/service/userService')()
const authValidation = require('./middlewares/validation')

/* GET users listing. */
router.get(
	'/:username',
	authValidation,
	function (req, res) {
		res.render('userInfo')
	}
)

router.get(
	'/:userName/lists',
	authValidation,
	function (req, res) {
		res.render('userLists')
	}
)

router.get(
	'/:username/lists/new',
	authValidation,
	function (req, res) {
		res.render('createNewList')
	}
)

router.post(
	'/:username/lists/new',
	authValidation,
	function (req, res, next) {
		const newList = new List(req.body.name, req.body.description)
		userService.putListInUser(req.user, newList, (err) => {
			if (err) return next(err)
			res.redirect(`/users/${req.params.username}/lists/${newList.id}`)
		})
	}
)

router.get(
	'/:username/lists/:listId',
	authValidation,
	function (req, res) {
		let list
		req.user.lists.find((item) => {
			if (item.id === req.params.listId) {
				list = item
				return true
			}
			return false
		})
		res.render('userSpecificList', list)
	}
)

router.post(
	'/:username/lists/:listId',
	authValidation,
	function (req, res, next) {
		userService.updateListOfUser(
			req.user,
			req.params.listId,
			req.body.movieID,
			req.body.poster,
			req.body.rating,
			(err) => {
				if (err) return next(err)
				res.redirect(`/movies/${req.body.movieID}`)
			})
	}
)

module.exports = router
