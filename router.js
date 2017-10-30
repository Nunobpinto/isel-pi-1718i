'use strict'

const fs = require('fs')
const controller = require('./controller')
const render = require('./service/viewService')
const url = require('url')

module.exports = router

const contentType = {
    html: "text/html",
    css: "text/css",
    ico: "image/vnd.microsoft.icon",
    jpg: "image/jpg"
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
		resp.setHeader('Content-Type', contentType.html)
		resp.end(data)
	})
}

function getEndPoint(pathname) {
	const req = pathname.split('/')[1]
	return req === '' ? controller['home'] : controller[req]
}

function setResponseNotFound(resp) {
	render('error', {title: 'ERROR', message: 'Page not found? INCONCEIVABLE.', statusCode: '404'}, (err, view) => {
		if(err)
			return err
		resp.statusCode = 404
		resp.setHeader('Content-Type', contentType.html)
		resp.end(view)
	})
}

function setErrorResponse(resp, err) {
	render('error', {title: 'An error occurred!!!', message: err.message, statusCode: err.statusCode}, (Viewerr, view) => {
		if(Viewerr)
			return Viewerr
		resp.statusCode = err.statusCode
		resp.setHeader('Content-Type', contentType.html)
		resp.end(view)
	})
}

function isAsset(url) {
    const assets = [
    	/\/css\/.*\.css$/,
        /\/img\/.*\.jpg$/,
        /\/favicon.ico/
    ]

    let decision = false
    assets.forEach(regex => {
        if(url.match(regex))
            return decision = true
    })
    return decision
}

function processAsset(resp, uri) {
    const assetsFolder = __dirname + '/public'

    if(uri.includes('/favicon.ico'))
        return setResponseFile(resp, assetsFolder + uri, contentType.ico)

	if(uri.includes('/css/'))
		return setResponseFile(resp, assetsFolder + uri, contentType.css)

    return setResponseFile(resp, assetsFolder + uri, contentType.jpg)
}

function setResponseFile(response, filepath, MIMEType) {
    fs.readFile(filepath, (err, data) => {
        if(err)
            return setErrorResponse(response, 'Failed to load ' + filepath)

		response.statusCode = 200
		response.setHeader('Content-Type', MIMEType)
        response.end(data)
    })
}