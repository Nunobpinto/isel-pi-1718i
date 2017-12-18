window.onload = function() {

	function btnAddFavOnClick() {

	}

	document
		.querySelectorAll('.divAddFavMovie')
		.forEach(div => {
			const btn = div.querySelector('.addToList')
			const username = div.querySelector('.username')
			const listID = div.querySelector('.listID')
			const movieID = div.querySelector('.movieID')
			const poster = div.querySelector('.poster')
			const rating = div.querySelector('.rating')
			btn.addEventListener('click', () => {
				const data =
					`movieID=${movieID.value}&poster=${poster.value}&rating=${rating.value}`
				const uri = `/users/${username.value}/lists/${listID.value}`
				httpRequest('POST', uri, data, (err) => {
					if (err) return alert(err)
					alert('Favourite Added!')

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
					alert('Movie Removed!')

				})
			})
		})



	function httpRequest(method, path, data, cb) {
		const xhr = new XMLHttpRequest()
		xhr.open(method, path, true)

		//Send the proper header information along with the request
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

		xhr.onreadystatechange = function() {//Call a function when the state changes.
			if(xhr.readyState === XMLHttpRequest.DONE) {
				if(xhr.status === 200)
					cb()
				else
					cb(new Error(xhr.status + ': ' + xhr.responseText))
			}
		}
		xhr.send(data);
	}
}