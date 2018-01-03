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
