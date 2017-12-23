function removeList(listId, username) {
    const path = `/users/${username}/lists`
    const data = `listID=${listId}`
    httpRequest('DELETE', path, data, err => {
        if (err) return alert(err.message)
        const mainDiv = document.getElementById('mainDiv')
        const divToRemove = document.getElementById(`list-${listId}`)
        mainDiv.removeChild(divToRemove)
    })
}

function showPopUp(id) {
    document.getElementById(`editListPopUp-${id}`).style.visibility = 'visible'
}

function hidePopUp(id) {
    document.getElementById(`editListPopUp-${id}`).style.visibility = 'hidden'
}

function editList(listId, username) {
    const path = `/users/${username}/lists/${listId}`
    const inputName = document.getElementById(`name-${listId}`)
    const inputDescription = document.getElementById(`description-${listId}`)
    const data = `name=${inputName.value}&description=${inputDescription.value}`
    httpRequest('PUT', path, data, (err) => {
        if (err) return alert(err.message)
        const html = `<a class="card-title" href="/users/${username}/lists/${listId}">
            <span id="themeColor">${inputName.value}</span>
            </a>`
        document
            .getElementById(`listName-${listId}`)
            .innerHTML = html
        inputName.value=""
        inputDescription.value=""
        hidePopUp(listId)
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
