class Vec2 {
	constructor(x=0, y=0) {
		if (x instanceof Vec2) {
			this.x = x.x
			this.y = x.y
		} else {
			this.x = x
			this.y = y
		}
	}
	
	static ZERO = new Vec2()
	static X = new Vec2(1, 0)
	static Y = new Vec2(0, 1)
	
	plus(v) { return new Vec2(this.x + v.x, this.y + v.y) }
	minus(v) { return new Vec2(this.x - v.x, this.y - v.y) }
	times(c) { return new Vec2(this.x * c, this.y * c) }
	dot(v) { return this.x * v.x + this.y * v.y }
	abs2() { return this.x * this.x + this.y * this.y }
	abs() { return Math.sqrt(this.x * this.x + this.y * this.y) }
	valueOf() { return this.x + " " + this.y }
	toString() { return "[" + this.x + "," + this.y + "]" }
	
	normalize(l=1) {
		let len2 = this.abs2()
		if (len2 == 0) return new Vec2()
		return this.times(l / Math.sqrt(len2))
	}
	
	static lerp(u, v, t) { return v.minus(u).times(t).plus(u) }
	
}