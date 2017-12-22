window.onload = function () {

    function removeList(listId, username) {
        const path = `/users/${{username}}/lists`
        const data = `listId=${listId}`
        httpRequest('DELETE', path, data, err => {
            if (err) return alert(err.message)
            const mainDiv = document.getElementsByName('mainDiv')
            const divToRemove = document.getElementsByName(`list-${listId}`)
            mainDiv.removeChild(divToRemove)
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
}