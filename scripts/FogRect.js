class FogRect {
	constructor(left, top, right=0, bottom=0) {
		if (left instanceof Vec2) {
			this.left = min(left.x, top.x)
			this.top = min(left.y, top.y)
			this.right = max(left.x, top.x)
			this.bottom = max(left.y, top.y)
		} else {
			this.left = left
			this.top = top
			this.right = right
			this.bottom = bottom
		}
		this.active = true
		this.selected = false
	}
	
	isUnderPoint(point) {
		return point.x >= this.left && point.x <= this.right && point.y >= this.top && point.y <= this.bottom
	}
	
	draw(editing, selected=this.selected) {
		if (!this.active && !editing) return
		
		ctx.fillStyle = editing ? (selected ? selectedcolor : editcolor) + (this.active ? "bf" : "2f") : black
		ctx.strokeStyle = ctx.fillStyle
		ctx.lineWidth = 1
		fillRect(this.left, this.top, this.right - this.left, this.bottom - this.top)
		strokeRect(this.left, this.top, this.right - this.left, this.bottom - this.top)
		
		if (!editing) return
		
		ctx.strokeStyle = selected ? selectedcolor : "#ffffff"
		ctx.lineWidth = 3
		let r = 0.5
		beginPath()
		moveTo(this.left + r, this.top)
		lineTo(this.right - r, this.top)
		moveTo(this.right, this.top + r)
		lineTo(this.right, this.bottom - r)
		moveTo(this.right - r, this.bottom)
		lineTo(this.left + r, this.bottom)
		moveTo(this.left, this.bottom - r)
		lineTo(this.left, this.top + r)
		stroke()
		
		strokeCircle(this.left, this.top, r)
		strokeCircle(this.right, this.top, r)
		strokeCircle(this.left, this.bottom, r)
		strokeCircle(this.right, this.bottom, r)
	}
	
	toString() {
		return `{"active":${this.active},"left":${this.left},"right":${this.right},"top":${this.top},"bottom":${this.bottom}}`
	}
}