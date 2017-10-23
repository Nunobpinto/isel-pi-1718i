'use strict'

const controller = require('./controller')
const render = require('./service/viewService')
const BadRequest = require('./errors/BadRequest')
const url = require('url')

module.exports = router

function isAsset(url) {
	const assets = [
		///\/public\/css\/\w.css/,
		/\/public\/img\/(defaultAvatar|defaultPoster).jpg/,
		/\/public\/favicon.ico/
	]

	let decision = false
	assets.forEach(regex => {
		if(url.match(regex))
			return decision = true
	})
	return decision
}

function processAsset(resp, uri) {

}

function router(req, resp) {
	const request = url.parse(req.url, true)
	const endPoint = getEndPoint(request.pathname)

	if (isAsset(request.pathname))
		return processAsset(resp, request.pathname)

	if (!endPoint)
		return setResponseNotFound(resp)

	endPoint(request, (err, data) => {
		if(err)
			return setErrorResponse(resp, err)
		resp.statusCode = 200
		resp.setHeader('Content-Type', 'text/html')
		resp.end(data)
	})
}

function getEndPoint(pathname) {
	const req = pathname.split('/')[1]
	return req === '' ? controller['home'] : controller[req]
}

function setResponseNotFound(resp) {
	render('404', {title: 'Page not found.'}, (err, view) => {
		if(err)
			return err
		resp.statusCode = 404
		resp.setHeader('Content-Type', 'text/html')
		resp.end(view)
	})
	resp.statusCode = 404
	resp.end()
}

function setErrorResponse(resp, err) {
	render('500', {title: 'An error occurred!!!', message: err}, (err, view) => {
		if(err)
			return err
		resp.statusCode = 500
		resp.setHeader('Content-Type', 'text/html')
		resp.end(view)
	})
}