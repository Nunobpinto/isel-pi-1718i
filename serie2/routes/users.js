const express = require('express')
const router = express.Router()

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
	//TODO: add a list to user
	const userName = req.params.userName
	res.redirect(`/${userName}/lists/${listId}`)
})

router.get('/:userName/lists/:listId', function(req, res, next) {
	//TODO: display a list
})

router.post('/:userName/lists/:listId', function(req, res, next) {
	//TODO: add a movie to list
	res.redirect(`/movies/${movieId}`)
})

module.exports = router
