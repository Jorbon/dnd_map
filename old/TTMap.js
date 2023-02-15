class TTMap {
	constructor(space=new LocalSpace(), img=document.createElement("img"), width=1, height=1) {
		this.pos = new V(0, 0);
		this.width = width;
		this.height = height;
		this.image = img;
		this.regions = [];
		this.space = space;
		this.selected = false;
		this.show = true;
	}

	static ctx = null;
	static unselectColor = "#7f7f7f7f";

	get x() { return this.pos.x; }
	get y() { return this.pos.y; }
	set x(n) { this.pos.x = n; }
	set y(n) { this.pos.y = n; }
	get left() { return this.x; }
	get right() { return this.x + this.width; }
	get top() { return this.y; }
	get bottom() { return this.y + this.height; }

	draw(mode=0) {
		if (!this.ctx || (!this.show && mode == 1))
			return;
		this.ctx.drawImage(this.image, ...this.space.outp(this.pos).c, this.space.outd(this.width), this.space.outd(this.height));
		for (let i = 0; i < this.regions.length; i++) this.regions[i].draw(mode);
		if (mode == 0 && !this.selected) {
			this.ctx.fillStyle = TTMap.unselectColor;
			this.ctx.fillRect(...this.space.outp(this.pos).c, this.space.outd(this.width), this.space.outd(this.height));
		}
	}
	addRegion(points=[], black=true) {
		let r = new TTMapRegion(this, points);
		r.black = black;
		this.regions.push(r);
	}
	addRectangularRegion(x, y, width=5, height=5, precalcbounds=null) {
		this.addRegion([new V(x, y), new V(x+width, y), new V(x+width, y+height), new V(x, y+height)], precalcbounds);
	}
	isUnderPoint(v) {
		return v.x >= this.x && v.y >= this.y && v.x < this.x + this.width && v.y < this.y + this.height;
	}
	blackAll() {
		for (let r of this.regions)
			r.black = true;
	}
	clearAll() {
		for (let r of this.regions)
			r.black = false;
	}
	toggleAll() {
		for (let r of this.regions)
			r.toggle();
	}
	deselect() { this.selected = false; }
	select() { this.selected = true; }
	selectAll() { for (let r of this.regions) r.select(); }
	deselectAll() { for (let r of this.regions) r.deselect(); }
	toJSON(tab=0) {
		let newLine = "\n";
		for (let i = 0; i < tab; i++) newLine += "\t";
		return `{${newLine}\t"pos": ${this.pos.toString()},${newLine}\t"width": ${this.width},${newLine}\t"height": ${this.height},${newLine}\t"imgsrc": "${this.image.src}",${newLine}\t"regions": [${newLine}\t\t${this.regions.map(r => r.toJSON(tab + 2)).join(", ")}${newLine}\t]${newLine}}`;
	}
	toMinJSON() {
		return `{"pos":${this.pos.toString(false)},"width":${this.width},"height":${this.height},"imgsrc":"${this.image.src}","regions":[${this.regions.map(r => r.toMinJSON()).join(",")}]}`;
	}
}

