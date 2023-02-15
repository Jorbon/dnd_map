class LocalSpace {
	constructor(z=1, x=0, y=0) {
		this.pos = new V(x, y);
		this.z = z;
	}
	get x() { return this.pos.x; }
	get y() { return this.pos.y; }
	set x(n) { this.pos.x = n; }
	set y(n) { this.pos.y = n; }
	outx(x) { return (x - this.pos.x) / this.z; };
	outy(y) { return (y - this.pos.y) / this.z; };
	outd(d) { return d / this.z; };
	inx(x) { return x * this.z + this.pos.x; };
	iny(y) { return y * this.z + this.pos.y; };
	ind(d) { return d * this.z; };
	outp(v) { return new V(this.outx(v.x), this.outy(v.y)); };
	inp(v) { return new V(this.inx(v.x), this.iny(v.y)); };
	inv(v) { return new V(this.ind(v.x), this.ind(v.y)); };
}

