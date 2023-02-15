// User IO

const mouse = new Vec2()
let mouseCanvasX = 0, mouseCanvasY = 0
let leftClick = false, rightClick = false
let dragging = false
let dragOrigin = new Vec2()


// Mouse activity

window.addEventListener("mousedown", event => {
	if (event.button == 0) leftClick = true
	else if (event.button == 2) rightClick = true
	
	if (!dragging) { // initialize dragging in case it meets the conditions to start
		dragOrigin.x = mouse.x
		dragOrigin.y = mouse.y
		
		if ((event.button == 2 || event.shiftKey) && !event.altKey) { // deselect everything if multiselecting isn't happening
			for (let image of images) image.selected = false
			for (let fog of fogs) fog.selected = false
		}
	}
})

window.addEventListener("mouseup", event => {
	if (event.button == 0) leftClick = false
	else if (event.button == 2) rightClick = false
	
	if (!editing) return
	
	if (!leftClick && !rightClick) {
		if (!dragging) {
			if (event.button == 2 || event.shiftKey) {
				
				// select a single item
				let selectedFog = false
				for (let i = fogs.length - 1; i >= 0; i--) {
					if (fogs[i].isUnderPoint(mouse)) {
						fogs[i].selected = true
						selectedFog = true
						break
					}
				}
				
				if (!selectedFog) {
					for (let i = images.length - 1; i >= 0; i--) {
						if (images[i].x <= mouse.x
						 && images[i].y <= mouse.y
						 && images[i].x + images[i].width >= mouse.x
						 && images[i].y + images[i].height >= mouse.y) {
							images[i].selected = true
							break
						}
					}
				}
			}
			
			// don't select anything else for a normal click
			return
		}
		
		// release dragging and select elements
		dragging = false
		
		let left = min(dragOrigin.x, mouse.x)
		let top = min(dragOrigin.y, mouse.y)
		let right = max(dragOrigin.x, mouse.x)
		let bottom = max(dragOrigin.y, mouse.y)
		const corners = [
			new Vec2(left, top),
			new Vec2(right, top),
			new Vec2(right, bottom),
			new Vec2(left, bottom)
		]
		
		for (let image of images) {
			if (image.selected) continue
			if (image.x <= right
			 && image.y <= bottom
			 && image.x + image.width >= left
			 && image.y + image.height >= top) {
				image.selected = true
			}
		}
		
		for (let fog of fogs) {
			if (fog.selected) continue
			if (fog instanceof FogRect) {
				if (fog.left <= right
					&& fog.top <= bottom
					&& fog.right >= left
					&& fog.bottom >= top) {
					   fog.selected = true
				   }
			} else {
				// All 3 tests are needed here because of edge cases
				// They could be simpler but it makes more sense this way and saves a little cpu
				
				// First test if any point in the path is in the box
				for (let p of fog.path) {
					if (p.x >= left
					 && p.x <= right
					 && p.y >= top
					 && p.y <= bottom) {
						fog.selected = true
						break
					}
				}
				
				if (fog.selected) continue
				
				// Test if any corners are in the path
				for (let n = 0; n < 4; n++) {
					if (fog.isUnderPoint(corners[n])) {
						fog.selected = true
						break
					}
				}
				
				if (fog.selected) continue
				
				// Test for any and all intersections between lines
				let a, b, c, d
				doubleloop:
				for (let n = 0; n < 3; n++) {
					a = corners[n]
					b = corners[n+1]
					
					for (let i = 0; i < fog.path.length; i++) {
						c = fog.path[i]
						if (i == fog.path.length - 1) d = fog.path[0]
						else d = fog.path[i+1]
						
						tf = ((b.x - a.x)*(c.y - a.y) - (c.x - a.x)*(b.y - a.y))
						   / ((d.x - c.x)*(b.y - a.y) - (b.x - a.x)*(d.y - c.y))
						ts = ((d.x - c.x)*(a.y - c.y) - (a.x - c.x)*(d.y - c.y))
						/ ((b.x - a.x)*(d.y - c.y) - (d.x - c.x)*(b.y - a.y))
						
						if (tf >= 0 && tf <= 1 && ts >= 0 && ts <= 1) {
							fog.selected = true
							break doubleloop
						}
					}
				}
			}
		}
	}
})

window.addEventListener("mousemove", event => {
	mouseCanvasX = event.x
	mouseCanvasY = event.y
	
	if (editing && (rightClick || (leftClick && event.shiftKey))) {
		if (!dragging) dragging = true
	} else if (leftClick) {
		view.x -= event.movementX * canvasToGrid
		view.y -= event.movementY * canvasToGrid
	}
	
	updateViewValues()
})

window.addEventListener("wheel", event => {
	dzoom = bind(zoom * event.deltaY * 0.0005, 1/12 - zoom, 5280 - zoom)
	zoom += dzoom
	updateViewValues()
	view.x += (view.x - mouse.x) * dzoom / zoom
	view.y += (view.y - mouse.y) * dzoom / zoom
})

const keys = {}
function isKeyPressed(key) { return !!keys[key] }


// Key presses

window.addEventListener("keydown", event => {
	const ctrl = event.metaKey || event.ctrlKey
	if (!ctrl) keys[event.key] = true
	
	if (ctrl) switch (event.key) {
		case "a": // select all
			if (ctrl) {
				event.preventDefault()
				for (let image of images) image.selected = true
				for (let fog of fogs) fog.selected = true
			}
		break
		case "i": // import a map image
			imageInput.click()
		break
		case "s": // save file
			event.preventDefault()
			saveFile(generateSaveData(), "save", "dndmap")
		break
		case "f":
			event.preventDefault()
		break
		case "o": // open save file
			event.preventDefault()
			if (images.length > 0 || fogs.length > 0) {
				if (!confirm("Merge saved file with current data?")) return
			}
			dndmapInput.click()
		break
		case "g":
			event.preventDefault()
		break
	}
	
	else switch (event.key) {
		case "p":
			editing = !editing
		break
		case "g": // toggle grid
			showgrid = !showgrid
		break
		case "5": // grid mode
			if (showgrid) only5ft = !only5ft
		break
		case "r": // reset all fogs to active
			for (let fog of fogs) fog.active = true
		break
		case " ":
			event.preventDefault()
			for (let i = fogs.length - 1; i >= 0; i--) {
				if (fogs[i].isUnderPoint(mouse)) {
					fogs[i].active = !fogs[i].active
					break
				}
			}
		break
		case "c":
			if (!editing) break
			if (buildCorner == null) buildCorner = getGridSnapPoint(mouse)
			else {
				let corner2 = getGridSnapPoint(mouse)
				if (abs(buildCorner.x - corner2.x) > SMOL
				 && abs(buildCorner.y - corner2.y) > SMOL) {
					fogs.push(new FogRect(buildCorner, corner2))
				}
				buildCorner = null
			}
		break
		case "f":
			if (!editing) break
			if (fogInProgress == null) fogInProgress = new Fog()
			let newpos = getGridSnapPoint(mouse)
			
			if (fogInProgress.path.length >= 3
			 && abs(newpos.x - fogInProgress.path[0].x) < SMOL
			 && abs(newpos.y - fogInProgress.path[0].y) < SMOL) {
				fogs.push(fogInProgress)
				fogInProgress = null
				break
			}
			
			let cancel = false
			for (let p of fogInProgress.path) {
				if (abs(newpos.x - p.x) < SMOL
				 && abs(newpos.y - p.y) < SMOL) {
					cancel = true
					break
				}
			}
			if (!cancel) fogInProgress.path.push(newpos)
		break
		case "Enter":
			if (!editing) break
			if (fogInProgress == null) break
			if (fogInProgress.path.length >= 3) fogs.push(fogInProgress)
			fogInProgress = null
		break
	}
})

window.addEventListener("keyup", event => { keys[event.key] = false })

