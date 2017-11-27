module.exports = CastMember

function CastMember(name, id, character, portrait) {
	this.name = name
	this.id = id
	this.character = character
	this.portrait = portrait
	this.toString = function () {
		return `Name:${name} , Id:${id} , Character: ${character}`
	}
}