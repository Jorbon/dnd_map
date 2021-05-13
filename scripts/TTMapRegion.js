class TTMapRegion {
	constructor(map, points, precalcbounds=null) {
		this.points = points;
		this.map = map;
		this.black = true;
		this.selected = false;
		this.updateBounds(precalcbounds);
	}
	isUnderPoint(v) {
		return v.x >= this.left && v.y >= this.top && v.x < this.right && v.y < this.bottom;
	}
	isUnderPointFull(cv) {
		if (!TTMap.ctx)
			return;
		this.loadPath();
		return TTMap.ctx.isPointInPath(...cv.c);
	}
	updateBounds(precalcbounds=null) {
		if (precalcbounds) {
			[this.left, this.right, this.top, this.bottom] = precalcbounds;
			return;
		}

		if (!this.points || this.points.length == 0) {
			this.left = 0, this.right = 0, this.top = 0, this.bottom = 0;
			return;
		}
		this.left = this.right = this.points[0].x;
		this.top = this.bottom = this.points[0].y;
		for (let i = 1; i < this.points.length; i++) {
			if (this.points[i].x < this.left) this.left = this.points[i].x;
			else if (this.points[i].x > this.right) this.right = this.points[i].x;
			if (this.points[i].y < this.top) this.top = this.points[i].y;
			else if (this.points[i].y > this.bottom) this.bottom = this.points[i].y;
		}
	}
	toggle() {
		this.black = !this.black;
	}
	addPoint(v, i=this.points.length) {
		this.points.splice(i, 0, v);
		updateBounds();
	}
	draw(mode=0, noGap=1.5) {
		if (!TTMap.ctx || (mode == 1 && !this.black))
			return;
		this.loadPath();
		TTMap.ctx.lineWidth = noGap;
		TTMap.ctx.strokeStyle = this.selected && mode == 0 ? "#dfdfdf" : "#000000";
		TTMap.ctx.fillStyle = this.selected && mode == 0 ? (this.black ? "#bf0000" : "#bf00007f") : (mode == 1 ? "#000000" : (this.black ? "#001f3f" : "#001f3f7f"));
		TTMap.ctx.fill();
		TTMap.ctx.stroke();
	}
	loadPath() {
		if (!TTMap.ctx)
			return;
		TTMap.ctx.beginPath();
		for (let i = 0; i < this.points.length; i++)
			this.map.space.outp(this.points[i].add(this.map.pos)).lineHere();
		TTMap.ctx.closePath();
	}
	select() { this.selected = true; }
	deselect() { this.selected = false; }
	toJSON(tab=0) {
		let newLine = "\n";
		for (let i = 0; i < tab; i++) newLine += "\t";
		return `{${newLine}\t"black": ${this.black},${newLine}\t"points": [${this.points.map(p => p.toString(false)).join(", ")}]${newLine}}`;
	}
	toMinJSON() {
		return `{"black":${this.black},"points":[${this.points.map(p => p.toString(false)).join(",")}]}`;
	}
}

