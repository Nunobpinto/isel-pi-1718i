window.onload = function () {

    document
        .querySelectorAll('.userListsOfMovies')
        .forEach(div => {
            const rename = div.querySelector('renameList').style.display="block"
            const listId = div.querySelector('listId')
            rename.addEventListener('click', () => {

                const uri = `/users/${username.value}/lists/${listId.value}`
                httpRequest('POST', uri, data, (err) => {
                    if (err) return alert(err)
                    alert('List field updated successfully!')

                })
            })
        })

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
}