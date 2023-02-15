/*
General purpose math and management stuff for general use.
Removes annoying Math namespace (π works), new math functions, event scheduling, n-dimensional vectors, matrices, 2d frames for nested coordinate references, and a bit of mouse and keyboard input help.
*/

const abs = Math.abs, sin = Math.sin, cos = Math.cos, tan = Math.tan, asin = Math.asin, acos = Math.acos, atan = Math.atan, atan2 = Math.atan2, floor = Math.floor, ceil = Math.ceil, round = Math.round, sign = Math.sign, sqrt = Math.sqrt, cbrt = Math.cbrt, min = Math.min, max = Math.max
const E = Math.E, PI = Math.PI, pi = Math.PI, π = Math.PI, SQRT2 = Math.SQRT2

function roundTo(n, d) { return round(n / d) * d }
function ceilTo(n, d) { return ceil(n / d) * d }
function floorTo(n, d) { return floor(n / d) * d }
function mod(n, d) { return n >= 0 ? n%d : d + n%d }
function lerp(min, max, t) { return (max - min) * t + min }
function unlerp(min, max, s) { return (s - min) / (max - min) }
function cubicLerp(min, max, t) { return (-2*t + 3) * t*t * (max - min) + min }
function sineLerp(min, max, t) { return (1 - cos(pi*t)) * 0.5 * (max - min) + min }
function bind(x, m1, m2) { return m1<m2 ? min(m2, max(m1, x)) : min(m1, max(m2, x)) }
function splitDecimal(num) { return [floor(num), mod(num, 1)] }

function wrap(x, m1, m2) {
	if (m2 < m1) { let mt = m1; m1 = m2; m2 = mt }
	return lerp(m1, m2, mod(unlerp(m1, m2, x), 1))
}

function integrate(f, a, b, steps=10000) {
	let sum = 0
	let stepsize = (b - a) / steps
	for (let i = a + stepsize*0.5; i < b; i += stepsize) sum += f(i)
	return sum * stepsize
}

const random = {
	int: function(n1=2, n2=0) { return floor(Math.random() * (n2 - n1)) + n1 },
	float: function(n1=1, n2=0) { return Math.random() * (n2 - n1) + n1 },
	choose: function(list) { return list[floor(Math.random() * list.length)] }
}
