const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

function resize() {
	canvas.width = window.innerWidth
	canvas.height = window.innerHeight
	canvas.ratio = canvas.height / canvas.width
	updateViewValues()
}
window.addEventListener("resize", resize)


// Functions

function beginPath() { ctx.beginPath() }
function closePath() { ctx.closePath() }
function fill() { ctx.fill() }
function stroke() { ctx.stroke() }
function moveTo(x, y) { ctx.moveTo((x - view.x) * gridToCanvas, (y - view.y) * gridToCanvas) }
function lineTo(x, y) { ctx.lineTo((x - view.x) * gridToCanvas, (y - view.y) * gridToCanvas) }
function isPointInPath(x, y) { return ctx.isPointInPath((x - view.x) * gridToCanvas, (y - view.y) * gridToCanvas) }
function fillRect(x, y, w, h) { ctx.fillRect((x - view.x) * gridToCanvas, (y - view.y) * gridToCanvas, w * gridToCanvas, h * gridToCanvas) }
function strokeRect(x, y, w, h) { ctx.strokeRect((x - view.x) * gridToCanvas, (y - view.y) * gridToCanvas, w * gridToCanvas, h * gridToCanvas) }
function drawImage(image, x, y, w, h) { ctx.drawImage(image, (x - view.x) * gridToCanvas, (y - view.y) * gridToCanvas, w * gridToCanvas, h * gridToCanvas) }
function arc(x, y, radius, startAngle, endAngle, counterclockwise) { ctx.arc((x - view.x) * gridToCanvas, (y - view.y) * gridToCanvas, radius * gridToCanvas, startAngle, endAngle, counterclockwise) }
function strokeCircle(x, y, radius) {
	ctx.beginPath()
	ctx.arc((x - view.x) * gridToCanvas, (y - view.y) * gridToCanvas, radius * gridToCanvas, 0, 2*pi)
	ctx.stroke()
}
function fillCircle(x, y, radius) {
	ctx.beginPath()
	ctx.arc((x - view.x) * gridToCanvas, (y - view.y) * gridToCanvas, radius * gridToCanvas, 0, 2*pi)
	ctx.fill()
}


function updateViewValues() {
	gridToCanvas = canvas.width / zoom
	canvasToGrid = zoom / canvas.width
	mouse.x = mouseCanvasX * canvasToGrid + view.x
	mouse.y = mouseCanvasY * canvasToGrid + view.y
}

function drawGrid() {
	ctx.strokeStyle = "#afafaf7f"
	ctx.lineWidth = 1
	let right = view.x + zoom
	let bottom = view.y + zoom * canvas.ratio
	
	let i = getGridLevel()
	if (only5ft) ctx.lineWidth = 2
	
	for (let n = 0; n < 3; n++) {
		let gridSize = gridLevels[i + n]
		
		for (let x = ceilTo(view.x, gridSize); x < right; x += gridSize) {
			beginPath()
			moveTo(x, view.y)
			lineTo(x, bottom)
			stroke()
		}
		
		for (let y = ceilTo(view.y, gridSize); y < bottom; y += gridSize) {
			beginPath()
			moveTo(view.x, y)
			lineTo(right, y)
			stroke()
		}
		
		if (only5ft) break
		
		ctx.lineWidth++
	}
}

function getGridLevel() {
	if (only5ft) return 3
	for (let i = 0; i < gridLevels.length; i++) if (zoom / gridLevels[i] < maxGridLines) return i
}

function getGridSnapPoint(point) {
	let gridSpacing = gridLevels[getGridLevel()]
	let newx = roundTo(point.x, gridSpacing)
	let newy = roundTo(point.y, gridSpacing)
	return new Vec2(newx, newy)
}






// Globals

let zoom = 100
let gridToCanvas = canvas.width / zoom
let canvasToGrid = zoom / canvas.width
let view = new Vec2(1, canvas.height / canvas.width).times(-0.5*zoom)
resize()

let showgrid = true
let only5ft = true
let maxGridLines = 60
let gridLevels = [1/192, 1/12, 1, 5, 660, 5280]
let editcolor = "#1f1f1f"
let black = "#000000"
let selectedcolor = "#ff5f5f"

let timeOfLastFrame = performance.now()
const SMOL = 0.001
const SMOL_ANGLE = 0.001

let imageLoadQueue = []
let images = []
let fogs = []

let editing = true
let buildCorner = null
let fogInProgress = null






// Draw

function draw() {
	requestAnimationFrame(draw)
	
	if (imageLoadQueue.length > 0) loadImage(imageLoadQueue.shift())
	
	
	
	// keyboard view controls
	let now = performance.now()
	let delta = now - timeOfLastFrame
	let ds = new Vec2(), dz = 0
	if (isKeyPressed("w")) ds.y--
	if (isKeyPressed("s")) ds.y++
	if (isKeyPressed("a")) ds.x--
	if (isKeyPressed("d")) ds.x++
	if (isKeyPressed("-") || isKeyPressed("_")) dz++
	if (isKeyPressed("=") || isKeyPressed("+")) dz--
	
	ds = ds.normalize().times(delta * zoom * 0.0004)
	let dzoom = zoom * 0.0005 * delta * dz
	zoom += dzoom
	view = view.plus(ds).plus(new Vec2(-dzoom * 0.5, -dzoom * canvas.ratio * 0.5))
	
	timeOfLastFrame = now
	updateViewValues()
	
	
	
	ctx.fillStyle = editing ? editcolor : black
	ctx.fillRect(0, 0, canvas.width, canvas.height)
	
	
	for (let image of images) image.draw(editing)
	for (let fog of fogs) fog.draw(editing)
	
	
	if (showgrid) drawGrid()
	
	if (buildCorner != null) {
		ctx.strokeStyle = "#ef4f4f"
		ctx.lineWidth = 5
		strokeCircle(buildCorner.x, buildCorner.y, 1)
	}
	
	if (fogInProgress != null) fogInProgress.draw(editing, false, true)
	
	if (dragging) {
		ctx.fillStyle = "#bf1f1f3f"
		ctx.strokeStyle = "#ff3f3fdf"
		ctx.lineWidth = 0.8
		fillRect(dragOrigin.x, dragOrigin.y, mouse.x - dragOrigin.x, mouse.y - dragOrigin.y)
		strokeRect(dragOrigin.x, dragOrigin.y, mouse.x - dragOrigin.x, mouse.y - dragOrigin.y)
	}
	
	
	
	
}

requestAnimationFrame(draw)
