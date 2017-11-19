'use strict'

const express = require('express')
const router = express.Router()

router.get('/',function (req, res, next) {
	if(req.user)
		delete req.user
	res.redirect('/home')
})

module.exports = router