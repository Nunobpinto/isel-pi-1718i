'use strict'

const app = require('express')
const movieService = require('../service/movieService')()
const router = app.Router()

router.get('/:actorId',function (req,res, next) {
	const actorId = req.params.actorId
	movieService.getActorDetails(actorId, (err, data) => {
		if(err) return next(err)
		res.render('actorDetails', data)
	})
})

module.exports = router