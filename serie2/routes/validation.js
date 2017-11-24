'use strict'

module.exports = {
	function(req,res,next){
		if(!req.user){
			return res.redirect('/auth/signin')
		}
		next()
	}
}