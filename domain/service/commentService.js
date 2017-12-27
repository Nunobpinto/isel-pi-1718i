'use strict'

const global = require('../../global')
const mapper = require('../mapper')
const utils = require('./serviceUtils')
const debug = require('debug')('LI52D-G11:commentService')

const commentsUrl = global.couchdb_url + '/comments/'

//TODO: add documentation
function init(dataSource) {
	let req
	if( dataSource )
		req = dataSource
	else
		req = require('request')

	return {
		// updateComment,
		// deleteComment,
		// getCommentChain,
		getComment,
		getCommentsByMovie,
		getCommentsByUser,
		createComment
	}

	function getComment(movieId, commentId, cb) {
		debug(`Fetching comment with id = "${commentId}" from comment chain with id = "${movieId}"`)
		req(utils.optionsBuilder(commentsUrl + movieId), (err, res, data) => {
			if( err ) return cb(err)
			//TODO: handle errors
			const comment = mapper.mapToComment(findCommentById(data.comments, commentId))
			cb(null, comment)
		})
	}

	function getCommentsByMovie(docId, cb) {
		debug(`Fetching comments from chain with id = "${docId}"`)
		req(utils.optionsBuilder(commentsUrl + docId), (err, res, data) => {
			if( err ) return cb(err)
			cb(null, data.comments)
		})
	}

	function getCommentsByUser(docId, username, cb) {
		debug(`Fetching comments from user with id = "${username}"`)
		req(utils.optionsBuilder(commentsUrl + docId), (err, res, data) => {
			if( err ) return cb(err)
			let comments = []
			findCommentsByUser(data.comments, username, comments)
			cb(null, comments)
		})
	}

	function createComment(docId, username, text, idToReply, cb) {
		debug(`Creating a comment on chain with id = "${docId}"`)
		req(utils.optionsBuilder(commentsUrl + docId), (err, res, data) => {
			if( err ) return cb(err)

			const comment = {
				id: utils.generateId(),
				movieId: docId,
				author: username,
				text: text,
				replies: []
			}
			if( res.statusCode === 404 ) return createCommentDoc(docId, comment, cb)

			if( idToReply ) findComment(data.comments, idToReply, comment)
			else data.comments.push(comment)
			req(utils.optionsBuilder(commentsUrl + docId, 'PUT', data), (err, res, data) => {
				if( err ) return cb(err)
				if( res.statusCode > 400 ) return cb({ message: 'Something broke!', status: res.statusCode })
				cb()
			})
		})
	}

	function createCommentDoc(docId, comment, cb) {
		debug(`Creating comment chain for movie with id = ${docId}`)
		const commentDoc = { comments: [comment] }
		req(utils.optionsBuilder(commentsUrl + docId, 'PUT', commentDoc), (err, res, data) => {
			if( err ) return cb(err)
			if( res.statusCode === 409 ) return cb()
			cb(data.comments)
		})
	}

	// function deleteComment(docId, commentId, cb) {
	//
	// }

	// function updateComment(docId, commendId, text, cb) { //Add update timestamps maybe
	//
	// }

	function findComment(commentChain, idToReply, reply) {
		commentChain.forEach((comment) => {
			if( comment.id === idToReply )
				return comment.replies.push(reply)
			findCommentById(comment.replies, idToReply, reply)
		})
	}

	function findCommentById(commentChain, id) {
		commentChain.forEach((comment) => {
			if( comment.id === id )
				return comment
			findCommentById(comment.replies, id)
		})
	}

	function findCommentsByUser(commentChain, username, array) {
		commentChain.forEach((comment) => {
			if( comment.author === username )
				array.push(mapper.mapToComment(comment))
			findCommentsByUser(comment.replies, username, array)
		})
	}
}