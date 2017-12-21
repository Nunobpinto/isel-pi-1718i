window.onload = function() {

	document
		.querySelectorAll('.divAddFavMovie')
		.forEach(div => {
			const btn = div.querySelector('.addToList')
			const username = div.querySelector('.username')
			const listID = div.querySelector('.listID')
			const movieID = div.querySelector('.movieID')
			btn.addEventListener('click', () => {
				const data =
					`movieID=${movieID.value}`
				const uri = `/users/${username.value}/lists/${listID.value}`
				httpRequest('POST', uri, data, (err) => {
					if (err) return alert(err)
					let div = document.getElementById(`addFilm${listID.value}`)
					div.classList.remove('divAddFilm')
					div.classList.add('divRemoveFilm')
					div.id = `removeFilm${listID.value}`
					let inputToRemove = document.getElementById("add")
					div.removeChild(inputToRemove)
					let inputToAdd = document.createElement('input');
					inputToAdd.setAttribute("value", "-")
					inputToAdd.className = "removeToList"
					inputToAdd.id = "remove"
					inputToAdd.setAttribute("type","submit")
					div.appendChild(inputToAdd)
				})
			})
		})

	document
		.querySelectorAll('.divRemoveFilm')
		.forEach(div => {
			const btnRemove = div.querySelector('.removeToList')
			const usernameRemove = div.querySelector('.username')
			const listIDRemove = div.querySelector('.listID')
			const movieIDRemove = div.querySelector('.movieID')
			btnRemove.addEventListener('click', () => {
				const data =
					`movieID=${movieIDRemove.value}`
				const uri = `/users/${usernameRemove.value}/lists/${listIDRemove.value}`
				httpRequest('DELETE', uri, data, (err) => {
					if (err) return alert(err)
					let div = document.getElementById(`removeFilm${listIDRemove.value}`)
					div.classList.remove('divRemoveFilm')
					div.classList.add('divAddFilm')
					div.id = `addFilm${listIDRemove.value}`
					let inputToRemove = document.getElementById("remove")
					div.removeChild(inputToRemove)
					let inputToAdd = document.createElement('input');
					inputToAdd.setAttribute("value", "+")
					inputToAdd.className = "addToList"
					inputToAdd.id = "add"
					inputToAdd.setAttribute("type","submit")
					div.appendChild(inputToAdd)
				})
			})
		})



	function httpRequest(method, path, data, cb) {
		const xhr = new XMLHttpRequest()
		xhr.open(method, path, true)

		//Send the proper header information along with the request
		xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')

		xhr.onreadystatechange = function() {//Call a function when the state changes.
			if(xhr.readyState === XMLHttpRequest.DONE) {
				if(xhr.status === 200)
					cb()
				else
					cb(new Error(xhr.status + ': ' + xhr.responseText))
			}
		}
		xhr.send(data)
	}
}