'use strict'

const global = require('../../global')
const mapper = require('../mapper')
const utils = require('./serviceUtils')
const debug = require('debug')('LI52D-G11:commentService')

const commentsUrl = global.couchdb_url + '/comments/'
const usersUrl = global.couchdb_url + '/users/'

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
		debug(`Fetching comment with id = "${commentId}" from movie with id = "${movieId}"`)
		req(utils.optionsBuilder(commentsUrl + movieId), (err, res, data) => {
			if( err ) return cb(err)
			//TODO: handle errors
			const comment = mapper.mapToComment(findCommentById(data.comments, commentId))
			cb(null, comment)
		})
	}

	function getCommentsByMovie(docId, cb) {
		debug(`Fetching comments from movie with id = "${docId}"`)
		req(utils.optionsBuilder(commentsUrl + docId), (err, res, data) => {
			if( err ) return cb(err)
			cb(null, { comments: data.comments })
		})
	}

	function getCommentsByUser(username, docIds, cb) {
		debug(`Fetching comments from user with id = "${username}"`)
		req(utils.optionsBuilder(commentsUrl + '_all_docs?include_docs=true', 'POST', { keys: docIds }), (err, res, data) => {
			if( err ) return cb(err)
			let comments = []
			data.rows.forEach((item) => {
				findCommentsByUser(item.doc.comments, username, comments)
			})
			cb(null, comments)
		})
	}

	function createComment(docId, movieName, user, text, idToReply, cb) {
		debug(`Creating a comment on movie with id = "${docId}"`)
		//Get comment document
		req(utils.optionsBuilder(commentsUrl + docId), (err, res, jsonComments) => {
			if( err ) return cb(err)

			const comment = {
				id: utils.generateId(),
				movieName: movieName,
				movieId: docId,
				author: user.username,
				text: text,
				replies: []
			}
			if( res.statusCode === 404 ) return createCommentDoc(docId, comment, user, cb)

			if( idToReply ) findComment(jsonComments.comments, idToReply, comment)
			else jsonComments.comments.unshift(comment)
			//Either insert new document or update existing one
			req(utils.optionsBuilder(commentsUrl + docId, 'PUT', jsonComments), (err, res, data) => {
				if( err ) return cb(err)
				if( res.statusCode > 400 ) return cb({ message: 'Something broke!', status: res.statusCode })

				if( user.commentedOn.some(doc => doc === docId) ) return cb(null, comment)

				user.commentedOn.push(docId)
				//Updates user with new doc
				req(utils.optionsBuilder(usersUrl + user.username, 'PUT', user), (err, res, data) => {
					if( err ) return cb(err)

					cb(null, comment)
				})
			})
		})
	}

	function createCommentDoc(docId, comment, user, cb) {
		debug(`Creating comment chain for movie with id = ${docId}`)
		const commentDoc = { comments: [comment] }
		req(utils.optionsBuilder(commentsUrl + docId, 'PUT', commentDoc), (err, res, data) => {
			if( err ) return cb(err)
			if( res.statusCode === 409 ) return cb()

			if( user.commentedOn.some(doc => doc === docId) ) return cb(null, comment)

			user.commentedOn.push(docId)
			//Updates user with new doc
			req(utils.optionsBuilder(usersUrl + user.username, 'PUT', user), (err, res, data) => {
				if( err ) return cb(err)

				cb(null, comment)
			})
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
				return comment.replies.unshift(reply)
			findComment(comment.replies, idToReply, reply)
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

module.exports = init