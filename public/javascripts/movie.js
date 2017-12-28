'use strict'


function addMovieToList(movieID, listID, username) {
	const data =
		`movieID=${movieID}`
	const uri = `/users/${username}/lists/${listID}`
	httpRequest('POST', uri, data, (err) => {
		if (err) return alert(err)
		let divToRemove = document.getElementById(`addFilm-${listID}`)
		let mainDiv = document.getElementById('mainDiv')
		mainDiv.removeChild(divToRemove)
		let divToAdd = document.createElement('div')
		divToAdd.setAttribute('id', `removeFilm-${listID}`)
		divToAdd.className += 'divRemoveFilm'
		const html =
			`<button onclick="removeMovieFromList('${movieID}','${listID}','${username}')" class="removeToList">-</button>`
		divToAdd.innerHTML = html
		mainDiv.appendChild(divToAdd)
	})
}

function removeMovieFromList(movieID, listID, username) {
	const data =
		`movieID=${movieID}`
	const uri = `/users/${username}/lists/${listID}`
	httpRequest('DELETE', uri, data, (err) => {
		if (err) return alert(err)
		let divToRemove = document.getElementById(`removeFilm-${listID}`)
		let mainDiv = document.getElementById('mainDiv')
		mainDiv.removeChild(divToRemove)
		let divToAdd = document.createElement('div')
		divToAdd.setAttribute('id', `addFilm-${listID}`)
		divToAdd.className += 'divRemoveFilm'
		const html =
			`<button onclick="addMovieToList('${movieID}','${listID}','${username}')" class="addToList">+</button>`
		divToAdd.innerHTML = html
		mainDiv.appendChild(divToAdd)
	})
}

function httpRequest(method, path, data, cb) {
	const xhr = new XMLHttpRequest()
	xhr.open(method, path, true)

	//Send the proper header information along with the request
	xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')

	xhr.onreadystatechange = function () {//Call a function when the state changes.
		if (xhr.readyState === XMLHttpRequest.DONE) {
			if (xhr.status === 200)
				cb()
			else
				cb(new Error(xhr.status + ': ' + xhr.responseText))
		}
	}
	xhr.send(data)
}