class V {
	constructor(c=[0, 0]) {
		this.c = [];
		if (typeof c == "number") for (var a = 0; a < arguments.length; a++) this.c.push(arguments[a]);
		else if (c instanceof V) for (var a = 0; a < c.c.length; a++) this.c[a] = c.c[a];
		else if (c instanceof Array) for (var a = 0; a < c.length; a++) this.c[a] = c[a];
	};
	get x() { return this.c[V.letterMap.x]; };
	get y() { return this.c[V.letterMap.y]; };
	get z() { return this.c[V.letterMap.z]; };
	get w() { return this.c[V.letterMap.w]; };
	get r() { return this.c[V.letterMap.r]; };
	get i() { return this.c[V.letterMap.i]; };
	get j() { return this.c[V.letterMap.j]; };
	get k() { return this.c[V.letterMap.k]; };
	get u() { return this.c[V.letterMap.u]; };
	get v() { return this.c[V.letterMap.v]; };
	set x(n) { this.c[V.letterMap.x] = n; };
	set y(n) { this.c[V.letterMap.y] = n; };
	set z(n) { this.c[V.letterMap.z] = n; };
	set w(n) { this.c[V.letterMap.w] = n; };
	set r(n) { this.c[V.letterMap.r] = n; };
	set i(n) { this.c[V.letterMap.i] = n; };
	set j(n) { this.c[V.letterMap.j] = n; };
	set k(n) { this.c[V.letterMap.k] = n; };
	set u(n) { this.c[V.letterMap.u] = n; };
	set v(n) { this.c[V.letterMap.v] = n; };
	static ctx = null;
	static letterMap = { x: 0, y: 1, z: 2, w: 3, r: 0, i: 1, j: 2, k: 3, u: 0, v: 1 };
	get dim() { return this.c.length; };
	set dim(dim) {
		var c = [];
		for (var a = 0; a < dim; a++) c.push(this.c[a] || 0);
		this.c = c;
	};
	setDim(dim, fill=0) {
		var c = [];
		for (var a = 0; a < dim; a++) {
			if (a < this.dim) c.push(this.c[a]);
			else c.push(fill);
		}
		this.c = c;
		return this;
	};
	fix(dim, fill=0) {
		var c = [];
		for (var a = 0; a < dim; a++) {
			if (a < this.dim) c.push(this.c[a]);
			else c.push(fill);
		}
		this.c = c;
		return this;
	}
	
	abs2() { return this.dot(this); };
	abs() { return sqrt(this.abs2()); };
	add(v) {
		var c = [];
		for (var a = 0; a < this.c.length; a++) c.push(this.c[a] + (v.c[a] || 0));
		return new V(c);
	};
	sub(v) {
		var c = [];
		for (var a = 0; a < this.c.length; a++) c.push(this.c[a] - v.c[a]);
		return new V(c);
	};
	mult(s) {
		if (s instanceof V) {
			var q1 = new V(this);
			var q2 = new V(s);
			q1.dim = 4;
			q2.dim = 4;
			return new V(
				q1.r * q2.r - q1.i * q2.i - q1.j * q2.j - q1.k * q2.k,
				q1.r * q2.i + q1.i * q2.r + q1.j * q2.k - q1.k * q2.j,
				q1.r * q2.j - q1.i * q2.k + q1.j * q2.r + q1.k * q2.i,
				q1.r * q2.k + q1.i * q2.j - q1.j * q2.i + q1.k * q2.r
			);
		} else {
			var c = [];
			for (var a = 0; a < this.dim; a++) c.push(this.c[a] * s);
			return new V(c);
		}
	};
	dot(v) {
		var total = 0;
		for (var a = 0; a < this.dim && a < v.dim; a++) total += this.c[a] * v.c[a];
		return total;
	};
	cross(v) {
		if (this.dim <= 2 && v.dim <= 2) return this.x*v.y - this.y*v.x;
		var v1 = new V(this), v2 = new V(v);
		v1.dim = 3; v2.dim = 3;
		return new V(v1.y * v2.z - v1.z * v2.y, v1.z * v2.x - v1.x * v2.z, v1.x * v2.y - v1.y * v2.x);
	};
	normalize() { return this.mult(1/this.abs()); };
	angle(v) { return acos(this.dot(v) / (this.abs() * v.abs())); };
	fullAngle(v) {
		if (this.x*v.y < this.y*v.x || this.dim > 2 || v.dim > 2) return this.angle(v);
		return 2*π - this.angle(v);
	};
	rotate(angle=0, axis=new V(0, 0, 1)) {
		if (this.dim === 2) return new V(this.x * cos(angle) - this.y * sin(angle), this.y * cos(angle) + this.x * sin(angle));
		else if (this.dim === 3) {
			var q = new V(cos(angle / 2), sin(angle / 2) * axis.x, sin(angle / 2) * axis.y, sin(angle / 2) * axis.z);
			var p = q.mult(new V(0, this.x, this.y, this.z)).mult(new V(q.r, -q.i, -q.j, -q.k));
			return new V(p.i, p.j, p.k);
		}
	};
	toString(space=true) {
		return "[" + this.c.join(space ? ", " : ",") + "]";
	}
	moveHere() { if (this.ctx) this.ctx.moveTo(this.c[0], this.c[1]); };
	lineHere() { if (this.ctx) this.ctx.lineTo(this.c[0], this.c[1]); };
	applyTransform(matrix) {
		if (!Matrix)
			return null;
		return new V(matrix.mult(new Matrix([matrix.dim.y, 1], this.c)).getCol());
	};
	applyInverseTransform(matrix, offset=new V()) {
		if (!Matrix)
			return null;
		if (matrix instanceof Matrix) return new V(matrix.inverse.mult(new Matrix([this.dim, 1], this.sub(offset).c)).getCol());
		else if (matrix.matrix instanceof Matrix) return new V(matrix.matrix.inverse.mult(new Matrix([this.dim, 1], this.sub(matrix.offset).c)).getCol());
	};
	static lerp(v1, v2, t) {
		return v2.sub(v1).mult(t).add(v1);
	};
	static fromPolar(r, a) {
		return new V(cos(a), sin(a)).mult(r);
	};
	op(fn) {
		let c = [];
		for (let i = 0; i < this.c.length; i++) c.push(fn(this.c[i]));
		return new V(c);
	};
};