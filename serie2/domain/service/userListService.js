'use strict'

const global = require('../../global')
const mapper = require('../mapper')
const utils = require('./serviceUtils')
const debug = require('debug')('serie2:userListService')

const listsUrl = global.couchdb_url + '/lists/'
const usersUrl = global.couchdb_url + '/users/'

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

	function getListById(listId, cb) {
		debug('Fetching list with id = ' + listId)
		req(utils.optionsBuilder('GET', listsUrl + listId), (err, res, body) => {
			if( err ) return cb(err)
			cb(null, mapper.mapToUserList(body))
		})
	}

	function getListsByUser(listIds, cb) {
		debug('Fetching lists with these ids = ' + listIds)
		req(utils.optionsBuilder('POST', listsUrl + '_all_docs?include_docs=true', { keys: listIds }),
			(err, res, data) => {
				if( err ) return cb(err)
				let lists = []
				data.rows.forEach((item) => {
					lists.push(mapper.mapToUserList(item.doc))
				})
				cb(null, lists)
			}
		)
	}

	function createList(listName, listDesc, user, cb) {
		debug(`Creating new list for user ${user.username} with name ${listName}`)
		const list = {
			listName,
			listDesc,
			items: []
		}
		req(utils.optionsBuilder('POST', listsUrl, list), (err, res, data) => {
			if( err ) return cb(err)
			user.lists.push(data.id)
			const list = mapper.mapToUserList({ listName, listDesc, items: [], _rev: data.rev })
			req(utils.optionsBuilder('POST', usersUrl + user.username, user),
				(err) => {
					if( err ) return cb(err)
					cb(null, list)
				}
			)
		})
	}

	function deleteList(listId, user, cb) {
		debug('Deleting list with id = ' + listId)
		req(utils.optionsBuilder('GET', listsUrl + '/' + listId), (err, res, data) => {
			if( err ) return cb(err)
			req(utils.optionsBuilder('DELETE', listsUrl + '/' + listId, data), (err) => {
				if( err ) return cb(err)
				const idxToRemove = user.lists.findIndex(list => list === listId)
				user.lists.splice(idxToRemove, 1)
				req(utils.optionsBuilder('PUT', listsUrl + '/' + user.username, user), (err) => {
					if( err ) return cb(err)
					cb()
				})
			})
		})
	}

	function addMovieToList(listId, movieId, moviePoster, movieRating, cb) {
		debug(`Adding movie with id = ${movieId} to list with id = ${listId}`)
		req(utils.optionsBuilder('GET', listsUrl + '/' + listId), (err, res, data) => {
			if( err ) cb(err)
			data.items.push({ movieId, moviePoster, movieRating })
			req(utils.optionsBuilder('PUT', listsUrl + '/' + listId, data), (err) => {
				if( err ) return cb(err)
				cb()
			})
		})
	}

	function removeMovieFromList(listId, movieId, cb) {
		debug(`Removing movie with id = ${movieId} from list with id = ${listId}`)
		req(utils.optionsBuilder('GET', listsUrl + '/' + listId), (err, res, data) => {
			if( err ) cb(err)
			const idxToRemove = data.items.findIndex(item => item.id === movieId)
			data.splice(idxToRemove, 1)
			req(utils.optionsBuilder('PUT', listsUrl + '/' + listId, { _rev: data.rev, items: data.items }),
				(err) => {
					if( err ) return cb(err)
					cb()
				}
			)
		})
	}
}

module.exports = init