'use strict'

const global = require('../../global')
const mapper = require('../mapper')

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
		const options = {
			method: 'GET',
			uri: listsUrl + listId,
		}
		req(options, (err, res, body) => {
			if( err ) return cb(err)
			cb(null, mapper.mapToUserList(JSON.parse(body)))
		})
	}

	function getListsByUser(listIds, cb) {
		const options = {
			method: 'POST',
			uri: listsUrl + '_all_docs?include_docs=true',
			json: { keys: listIds }
		}
		req(options, (err, res, data) => {
			if( err ) return cb(err)
			let lists = []
			data.rows.forEach((item) => {
				lists.push(mapper.mapToUserList(item.doc))
			})
			cb(null, lists)
		})
	}

	function createList(listName, listDesc, user, cb) {
		let options = {
			method: 'POST',
			uri: listsUrl,
			json: { listName, listDesc, items: [] }
		}
		req(options, (err, res, data) => {
			if( err ) return cb(err)
			user.lists.push(data.id)
			const list = mapper.mapToUserList({ listName, listDesc, items: [], _rev: data.rev })
			options.uri = usersUrl + user.username
			options.json = user
			options.method = 'PUT'
			req(options, (err, res, data) => {
				if( err ) return cb(err)
				cb(null, list)
			})
		})
	}

	function deleteList(listId, user, cb) {
		//Get list rev
		req(listsUrl + '/' + listId, (err, res, data) => {
			if( err ) return cb(err)
			//delete list
			const options = {
				method: 'DELETE',
				uri: listsUrl + '/' + listId,
				json: { data }
			}
			req(options, (err) => {
				if( err ) return cb(err)
				//delete entry on user
				const idxToRemove = user.lists.findIndex(list => list === listId)
				user.lists.splice(idxToRemove, 1)
				options.method = 'PUT'
				options.uri = listsUrl + '/' + user.username
				options.json = user
				req(options, (err) => {
					if( err ) return cb(err)
					cb()
				})
			})
		})
	}

	function addMovieToList(listId, movieId, moviePoster, movieRating, cb) {
		req(listsUrl + '/' + listId, (err, res, data) => {
			if( err ) cb(err)
			const list = JSON.parse(data)
			list.items.push({ movieId, moviePoster, movieRating })
			const options = {
				method: 'PUT',
				uri: listsUrl + '/' + listId,
				json: list
			}
			req(options, (err) => {
				if( err ) return cb(err)
				cb()
			})
		})
	}

	function removeMovieFromList(listId, movieId, cb) {
		req(listsUrl + '/' + listId, (err, res, data) => {
			if( err ) cb(err)
			const idxToRemove = data.items.findIndex(item => item.id === movieId)
			data.splice(idxToRemove, 1)
			const options = {
				method: 'PUT',
				uri: listsUrl + '/' + listId,
				json: {
					_rev: data.rev,
					items: data.items
				}
			}
			req(options, (err) => {
				if( err ) return cb(err)
				cb()
			})
		})
	}
}

module.exports = init