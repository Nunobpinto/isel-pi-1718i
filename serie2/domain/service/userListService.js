'use strict'

const global = require('../../global')
const mapper = require('../mapper')
const utils = require('./serviceUtils')
const debug = require('debug')('serie2:userListService')

const listsUrl = global.couchdb_url + '/lists/'
const usersUrl = global.couchdb_url + '/users/'

/**
 * Obtain data from provided dataSource and manages user movie list interaction with application
 * @param {function} dataSource - repository (local or a Web API)
 * @returns {getListById, getListsByUser, createList, deleteList, addMovieToList, removeMovieFromList}
 */
function init(dataSource) {
	let req
	if( dataSource )
		req = dataSource
	else
		req = require('request')

	return {
		getListById,
		getListsByUser,
		createList,
		deleteList,
		addMovieToList,
		removeMovieFromList
	}

	/**
	 * Get list with the id received in param
	 * @param {string} listId
	 * @param {string} username
	 * @param {function} cb(err, UserList)
	 */
	function getListById(listId, username, cb) {
		debug('Fetching list with id = ' + listId)
		req(utils.optionsBuilder(listsUrl + listId), (err, res, body) => {
			if( err ) return cb(err)
			const list = mapper.mapToUserList(body)
			if( res.statusCode === 404 || list.owner !== username ) return cb({ message: 'List not found!', status: 404 })
			cb(null, list)
		})
	}

	/**
	 * Get user lists according to the list ids received
	 * @param {Array<string>} listIds
	 * @param {function} cb(err, Array<UserList>)
	 */
	function getListsByUser(listIds, cb) {
		debug('Fetching lists with these ids = ' + listIds)
		req(utils.optionsBuilder(listsUrl + '_all_docs?include_docs=true', 'POST', { keys: listIds }),
			(err, res, data) => {
				if( err ) return cb(err)
				if( res.statusCode > 400 ) return cb({ message: 'Something broke!', status: res.statusCode })
				let lists = []
				data.rows.forEach((item) => {
					lists.push(mapper.mapToUserList(item.doc))
				})
				cb(null, lists)
			}
		)
	}

	/**
	 * Creates a list with the given parameters and adds its id to the array of ids of the given user
	 * @param {string} listName
	 * @param {string} listDesc
	 * @param {User} user
	 * @param {function} cb(err, UserList)
	 */
	function createList(listName, listDesc, user, cb) {
		debug(`Creating new list for user ${user.username} with name ${listName}`)
		const list = {
			listName,
			listDesc,
			owner: user.username,
			items: []
		}
		req(utils.optionsBuilder(listsUrl, 'POST', list), (err, res, data) => {
			if( err ) return cb(err)
			if( res.statusCode > 400 ) return cb({ message: 'Something broke!', status: res.statusCode })
			user.lists.push(data.id)
			const list = mapper.mapToUserList({
				listName,
				listDesc,
				owner: user.username,
				items: [],
				_rev: data.rev,
				_id: data.id
			})
			req(utils.optionsBuilder(usersUrl + user.username, 'PUT', user),
				(err, res) => {
					if( res.statusCode > 400 ) return cb({ message: 'Something broke!', status: res.statusCode })
					if( err ) return cb(err)
					cb(null, list)
				}
			)
		})
	}

	/**
	 * Deletes list with the given id and removes it from the specified user's list array
	 * @param {string} listId
	 * @param {User} user
	 * @param {function} cb(err) if successful, no parameters are passed to the callback
	 */
	function deleteList(listId, user, cb) {
		debug('Deleting list with id = "' + listId + '" of user = ' + user.username)
		req(utils.optionsBuilder(listsUrl + listId), (err, res, data) => {
			if( err ) return cb(err)
			if( res.statusCode === 404 ) return cb({ message: 'List not found!', status: res.statusCode })
			req(utils.optionsBuilder(listsUrl + listId + `?rev=${data._rev}`, 'DELETE'), (err, res) => {
				if( err ) return cb(err)
				if( res.statusCode > 400 ) return cb({ message: 'Something broke!', status: res.statusCode })
				const idxToRemove = user.lists.findIndex(list => list === listId)
				user.lists.splice(idxToRemove, 1)
				req(utils.optionsBuilder(usersUrl + user.username, 'PUT', user), (err, res) => {
					if( err ) return cb(err)
					if( res.statusCode > 400 ) return cb({ message: 'Something broke!', status: res.statusCode })
					cb()
				})
			})
		})
	}

	/**
	 * Add specific movie to list with id received in param
	 * @param {string} listId
	 * @param {string} movieId
	 * @param {string} moviePoster
	 * @param {string} movieRating
	 * @param {function} cb(err) if successful, no parameters are passed to the callback
	 */
	function addMovieToList(listId, movieId, moviePoster, movieRating, cb) {
		debug(`Adding movie with id = ${movieId} to list with id = ${listId}`)
		req(utils.optionsBuilder(listsUrl + listId), (err, res, data) => {
			if( err ) cb(err)
			if( res.statusCode === 404 ) return cb({ message: 'List not found!', status: res.statusCode })
			data.items.push({ movieId, moviePoster, movieRating })
			req(utils.optionsBuilder(listsUrl + listId, 'PUT', data), (err, res) => {
				if( err ) return cb(err)
				if( res.statusCode > 400 ) return cb({ message: 'Something broke!', status: res.statusCode })
				cb()
			})
		})
	}

	/**
	 * Remove specified movie from list with id received in param
	 * @param {string} listId
	 * @param {string} movieId
	 * @param {function} cb(err) if successful, no parameters are passed to the callback
	 */
	function removeMovieFromList(listId, movieId, cb) {
		debug(`Removing movie with id = ${movieId} from list with id = ${listId}`)
		req(utils.optionsBuilder(listsUrl + listId), (err, res, data) => {
			if( err ) cb(err)
			if( res.statusCode === 404 ) return cb({ message: 'List not found!', status: res.statusCode })
			const idxToRemove = data.items.findIndex(item => parseInt(item.movieId) === movieId)
			data.items.splice(idxToRemove, 1)
			req(utils.optionsBuilder(listsUrl + listId, 'PUT', data),
				(err, res) => {
					if( err ) return cb(err)
					if( res.statusCode > 400 ) return cb({ message: 'Something broke!', status: res.statusCode })
					cb()
				}
			)
		})
	}
}

module.exports = init