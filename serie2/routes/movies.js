'use strict'

const app = require('express')
const movieService = require('../domain/service/tmdbService')()
const router = app.Router()

router.get('/search',function (req, res, next) {
	const name = req.query['name']
	const page = req.query['page']
	movieService.getMovieList(name,page,(err, data)=>{
		if(err) return next(err)
		res.render('movieList',data)
	})
})

router.get('/:movieId',function (req,res, next) {
	const movieId = req.params.movieId
	movieService.getMovieDetails(movieId, (err, data) => {
		if(err) next(err)
		res.render('movieDetails', data)
	})
})

module.exports = router

