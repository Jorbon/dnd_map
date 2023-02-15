class Fog {
	constructor(path=[]) {
		this.path = path
		this.active = true
		this.selected = false
	}
	
	isUnderPoint(point) {
		beginPath()
		for (let p of this.path) lineTo(p.x, p.y)
		return isPointInPath(point.x, point.y)
	}
	
	draw(editing, selected=this.selected, inProgress=false) {
		if (!this.active && !editing) return
		
		ctx.fillStyle = editing ? (selected ? selectedcolor : editcolor) + (this.active ? "bf" : "2f") : black
		ctx.strokeStyle = ctx.fillStyle
		ctx.lineWidth = 1
		
		beginPath()
		for (let p of this.path) lineTo(p.x, p.y)
		fill()
		stroke()
		
		if (!editing) return
		
		ctx.strokeStyle = inProgress ? "#1fef1f" : (selected ? selectedcolor : "#ffffff")
		ctx.lineWidth = 3
		let r = 0.5
		beginPath()
		let i, start, end, v
		for (i = 0; i < this.path.length; i++) {
			if (i == this.path.length - 1) {
				if (inProgress) {
					stroke()
					break
				}
				end = this.path[0]
			} else end = this.path[i+1]
			start = this.path[i]
			v = end.minus(start).normalize(r)
			start = start.plus(v)
			end = end.minus(v)
			moveTo(start.x, start.y)
			lineTo(end.x, end.y)
		}
		stroke()
		for (let p of this.path) strokeCircle(p.x, p.y, r)
	}
	
	toString() {
		return `{"active":${this.active},"path":[${this.path.join(",")}]}`
	}
}