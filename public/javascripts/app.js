'use strict'

// by default "cast" tab is opened
let currentTab = 'Cast'

window.onload = function() {
	const children = document.querySelectorAll('.tablinks')
	if(children === null )
		return
	for( let i = 0; i < children.length; ++i ) {
		children[i].addEventListener('click', e => {
			e.preventDefault()
			selectTab(e, e.currentTarget.textContent)
		})
	}

	function selectTab(e, newTab) {
		// if it's the same tab, do nothing
		if( newTab === currentTab )
			return

		// hide previous tab's content
		document.getElementById(currentTab).className = 'hidetabcontent'

		// Get all elements with class="tablinks" and remove the class "active"
		const tabs = document.querySelectorAll('.tablinks')
		for(let i = 0; i < tabs.length; ++i)
			tabs[i].className = tabs[i].className.replace(' active', '')

		// Show the current tab, and add an "active" class to the button that opened the tab
		document.getElementById(newTab).className = 'highlighttabcontent'
		e.currentTarget.className += ' active'

		// update current tab
		currentTab = newTab
	}
}