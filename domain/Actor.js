module.exports = Actor

function Actor(biography, birthday, deathday, id, name, popularity, portrait) {
	this.name = name
	this.id = id
	this.biography = biography
	this.birthday = birthday
	this.deathday = deathday
	this.popularity = popularity
	this.portrait = portrait
	this.filmography=[]
	this.toString = function () {
		return `Name:${name} , Id:${id} , biography: ${biography}, birthday: ${birthday}, deathday: ${deathday}, popularity ${popularity}, portrait ${portrait}`
	}
}