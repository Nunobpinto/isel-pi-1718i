'use strict'

const express = require('express')
const router = express.Router()

module.exports = router

router.post('/favourites', (req, res, next) => {
	if(!req.user) return res.redirect('/login')
	req.user.lists.push({

	})
	res.redirect('/home')
})
