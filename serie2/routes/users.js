const express = require('express')
const router = express.Router()
const List = require('../model/UserList')
const userService = require('../service/userService')()

/* GET users listing. */
router.get('/:username', function (req, res) {
	res.render('userInfo')
})

router.get('/:userName/lists', function (req, res) {
	res.render('userLists')
})

router.get('/:username/lists/new', function (req, res) {
	res.render('createNewList')
})

router.post('/:username/lists/new', function (req, res, next) {
	const newList = new List(req.body.name, req.body.description)
	userService.addList(req.user, newList, (err) => {
		if (err) return next(err)
		res.redirect(`/users/${req.params.username}/lists/${newList.id}`)
	})
})

router.get('/:username/lists/:listId', function (req, res) {
	let list
	req.user.lists.find((item) => {
		if (item.listId === req.query[':listId']) {
			list = item
			return true
		}
		return false
	})
	res.render('userSpecificList', list)
})

router.post('/:username/lists/:listId', function (req, res, next) {
	/*const userName = req.params.userName
    const listID = req.params.listId
    const movie = {
        movieID : req.body.movieID,
        poster : req.body.poster,
        voteAverage : req.body.rating
    }
    userService.addMovieToList(userName,listID,movie)
    res.redirect(`/movies/${movieId}`)*/
	userService.addMovieToList(
		req.user,
		req.params.listId,
		req.body.movieID,
		req.body.poster,
		req.body.rating,
		(err) => {
			if (err) return next(err)
			res.redirect(`/movies/${req.body.movieID}`)
		})
})

module.exports = router
