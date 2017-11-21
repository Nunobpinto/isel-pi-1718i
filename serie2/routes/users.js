const express = require('express')
const router = express.Router()
const List = require('../model/UserList')
const userService = require('../service/userService')()

/* GET users listing. */
router.get('/:userName', function(req, res, next) {
	//TODO: display user profile
	res.send('respond with a resource')
})

router.get('/:userName/lists', function(req, res, next) {
	//TODO: display all lists
})

router.get('/:userName/lists/new', function(req, res, next) {
	//TODO: display new list form
})

router.post('/:userName/lists/new', function(req, res, next) {
	const userName = req.params.userName
	const newListName = req.body.name
	const description = req.body.description
	const newList = new List(newListName,description)
	userService.addList(userName,newList)
	res.redirect(`/${userName}/lists/${listId}`)
})

router.get('/:userName/lists/:listId', function(req, res, next) {
	//TODO: display a list
})

router.post('/:userName/lists/:listId', function(req, res, next) {
	const userName = req.params.userName
	const listID = req.params.listId
	const movie = {
		movieID : req.body.movieID,
		poster : req.body.poster,
		voteAverage : req.body.rating
	}
	userService.addMovieToList(userName,listID,movie)
	res.redirect(`/movies/${movieId}`)
})

module.exports = router
