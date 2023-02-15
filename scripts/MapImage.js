class MapImage {
	constructor(image, x, y, width, height) {
		this.image = image
		this.x = x
		this.y = y
		this.width = width
		this.height = height
		this.selected = false
	}
	
	draw(editing, selected=this.selected) {
		drawImage(this.image, this.x, this.y, this.width, this.height)
		if (editing && selected) {
			ctx.fillStyle = "#1fbf1f3f"
			ctx.strokeStyle = "#3fff3fdf"
			fillRect(this.x, this.y, this.width, this.height)
			strokeRect(this.x, this.y, this.width, this.height)
		}
	}
	
	toString() {
		return `{"x":${this.x},"y":${this.y},"width":${this.width},"height":${this.height},"src":"${this.image.src}"}`
	}
}