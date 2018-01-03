'use strict'

const global = require('../../global')
const mapper = require('../mapper')
const utils = require('./serviceUtils')
const debug = require('debug')('LI52D-G11:userListService')
const movieService = require('./tmdbService')()

const listsUrl = global.couchdb_url + '/lists/'
const usersUrl = global.couchdb_url + '/users/'

/**
 * Obtain data from provided dataSource and manages user movie list interaction with application
 * @param {function} dataSource - repository (local or a Web API)
 * @returns {{getListById: getListById, getListsByUserPaginated: getListsByUserPaginated, getListsByUser: getListsByUser, createList: createList, deleteList: deleteList, updateList: updateList, addMovieToList: addMovieToList, removeMovieFromList: removeMovieFromList}}
 */
function init(dataSource) {
	let req
	if( dataSource )
		req = dataSource
	else
		req = require('request')

	return {
		getListById,
		getListsByUserPaginated,
		getListsByUser,
		createList,
		deleteList,
		updateList,
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
	 * Get paginated user lists according to the list ids received
	 * @param {Array<string>} listIds
	 * @param {int} listIds
	 * @param {int} page
	 * @param {function} cb(err, Array<UserList>)
	 */
	function getListsByUserPaginated(listIds, page, cb) {
		debug('Fetching lists with these ids = ' + listIds)
		let offset = (page - 1) * 4
		let limit = 4
		const queryString =
			`_all_docs?include_docs=true&limit=${limit}&skip=${offset}`
		req(utils.optionsBuilder(listsUrl + queryString, 'POST', {keys:listIds}),
			(err, res, data) => {
				if( err ) return cb(err)
				if( res.statusCode > 400 ) return cb({ message: 'Something broke!', status: res.statusCode })
				let lists = []
				data.rows.forEach((item) => {
					lists.push(mapper.mapToUserList(item.doc))
				})
				cb(null, {lists:lists, rows : data.rows.length})
			}
		)
	}

	function getListsByUser(listIds, cb) {
		debug('Fetching lists with these ids = ' + listIds)
		const queryString =
			'_all_docs?include_docs=true'
		req(utils.optionsBuilder(listsUrl + queryString, 'POST', {keys:listIds}),
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
     * Update specific user list of movies with id received in param
     * @param {string} listId
     * @param {string} listName
     * @param {string} listDesc
     * @param {string} user
     * @param {function} cb(err) if successful, no parameters are passed to the callback
     */
	function updateList(listId, listName, listDesc, username, cb) {
        debug('Updating list with id = "' + listId + '" of user = ' + username)
		req(utils.optionsBuilder(listsUrl + listId), (err, res, data)=>{
			if(err) return cb(err)
			if(res.statusCode === 404) return cb({message:  'List not found!', status: res.statusCode })
			data = mapper.mapToUserList(data)
			data.listName = listName
			if(listDesc!==''){
                data.listDesc = listDesc
			}
			req(utils.optionsBuilder(listsUrl + data.id, 'PUT', data), (err, res) => {
				if( err ) return cb(err)
				if( res.statusCode > 400 ) return cb({ message: 'Something broke!', status: res.statusCode })
				cb()
			})
		})
    }

	/**
	 * Add specific movie to list with id received in param
	 * @param {string} listId
	 * @param {string} movieId
	 * @param {function} cb(err) if successful, no parameters are passed to the callback
	 */
	function addMovieToList(listId, movieId,  cb) {
		debug(`Adding movie with id = ${movieId} to list with id = ${listId}`)
		movieService.getMovieDetails(movieId,(err,movie)=>{
			let moviePoster = movie.poster
			let movieRating = movie.voteAverage
			if(err) return cb(err)
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
			const idxToRemove = data.items.findIndex(item => item.movieId === movieId)
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