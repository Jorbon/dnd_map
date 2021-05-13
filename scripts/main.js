const canvas = document.getElementById("canvas");
const sidebar = document.getElementById("sidebar");
const ctx = canvas.getContext("2d");

V.ctx = ctx, TTMap.ctx = ctx;

const imageInput = document.getElementById("image-input");
const dndmapInput = document.getElementById("dndmap-input");


window.addEventListener("contextmenu", event => { event.stopPropagation(); event.preventDefault(); });
window.addEventListener("dragenter", event => { event.stopPropagation(); event.preventDefault(); });
window.addEventListener("dragover", event => { event.stopPropagation(); event.preventDefault(); });

const mouse = new Mouse();
mouse.setParent(canvas);

function resize() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	canvas.size = new V(canvas.width, canvas.height);
}
resize();
window.addEventListener("resize", resize);




canvas.addEventListener("mousedown", event => {
	panka = false;
	if (mode == 0) {
		if ((event.shiftKey || event.button == 2) && !dragka) {
			dragka = true;
			dragstart = inp(mouse);
		}
	}
});

window.addEventListener("mouseup", event => {
	if (mode == 0 && dragka && !mouse.button.l) {
		dragka = false;

		// box select
		let left, right, top, bottom;
		if (inx(mouse.x) > dragstart.x) left = dragstart.x, right = inx(mouse.x);
		else left = inx(mouse.x), right = dragstart.x;
		if (iny(mouse.y) > dragstart.y) top = dragstart.y, bottom = iny(mouse.y);
		else top = iny(mouse.y), bottom = dragstart.y;

		if (event.altKey) { // maps
			for (let map of maps) map.selected = (left < map.right && right > map.left) && (top < map.bottom && bottom > map.top);
		} else { // regions
			for (let map of maps) if (map.selected) for (let r of map.regions) r.selected = (left < r.right + r.map.x && right > r.left + r.map.x) && (top < r.bottom + r.map.y && bottom > r.top + r.map.y);
		}
	}

	if (mode == 0 && !dragka && !panka) {
		// single select
		if (event.altKey) { // maps
			let found = false;
			for (let i = maps.length-1; i >= 0; i--) {
				maps[i].deselect();
				if (!found && maps[i].isUnderPoint(inp(mouse))) {
					maps[i].select();
					found = true;
				}
			}
		} else { // regions
			let found = false;
			for (let i = maps.length-1; i >= 0; i--) {
				if (maps[i].selected) for (let j = maps[i].regions.length-1; j >= 0; j--) {
					maps[i].regions[j].deselect();
					if (!found && maps[i].regions[j].isUnderPointFull(mouse)) {
						maps[i].regions[j].select();
						found = true;
					}
				}
			}
		}
	}
});

canvas.addEventListener("mousemove", event => {
	panka = true;
	if (mouse.button.r || (mouse.button.l && event.shiftKey))
		if (!event.shiftKey && !dragka && mode == 0)
			dragka = true;
	if (mouse.button.l && !event.shiftKey)
		cam.pos = cam.pos.sub(inv(mouse.d));
});

canvas.addEventListener("wheel", event => {
	cam.pos = cam.pos.add(inv(mouse));
	cam.z *= 1 + event.deltaY / 2000;
	if (cam.z > 2640) cam.z = 2640;
	if (cam.z < 0.000025) cam.z = 0.000025;
	cam.pos = cam.pos.sub(inv(mouse));
});

const keys = [];
for (let i = 0; i < 256; i++) { keys[i] = false; }
window.addEventListener("keydown", event => {
	if (!(event.metaKey || event.ctrlKey))
		keys[event.which || event.keyCode] = true;

	if (mode == 0 && mouse.button.l && event.key == "Shift" && !dragka) {
		dragka = true;
		dragstart = inp(mouse);
	}

	switch (event.key) {
	case "a": // select all
		if (event.metaKey || event.ctrlKey) {
			event.preventDefault();
			if (mode == 0) {
				if (event.altKey) for (let map of maps) map.select();
				else for (let map of maps) if (map.selected) map.selectAll();
			}
		}
		break;
	case "g": // toggle grid
		if (event.metaKey || event.ctrlKey)
			event.preventDefault();
		grid = !grid;
		break;
	case "m": // present mode
		if (mode == 1)
			mode = 0;
		else
			mode = 1;
		break;
	case "Backspace": // delete selection
		if (mode == 0) {
			if (event.altKey) {
				let newMaps = [];
				for (let i in maps)
					if (!maps[i].selected)
						newMaps.push(maps[i]);
				maps = newMaps;
			} else {
				for (let map of maps) if (map.selected) {
					let newrs = [];
					for (let i in map.regions)
						if (!map.regions[i].selected)
							newrs.push(map.regions[i]);
					map.regions = newrs;
				}
			}
		}
		break;
	case "ArrowLeft":
		if (mode != 0)
			break;
		if (event.altKey) { for (let map of maps) if (map.selected) map.x -= getGridLevel() * (1 + 4*event.shiftKey); }
		else for (let map of maps) if (map.selected) for (let r of map.regions) if (r.selected) for (let p of r.points) p.x -= getGridLevel() * (1 + 4*event.shiftKey);
		break;
	case "ArrowRight":
		if (mode != 0)
			break;
		if (event.altKey) { for (let map of maps) if (map.selected) map.x += getGridLevel() * (1 + 4*event.shiftKey); }
		else for (let map of maps) if (map.selected) for (let r of map.regions) if (r.selected) for (let p of r.points) p.x += getGridLevel() * (1 + 4*event.shiftKey);
		break;
	case "ArrowUp":
		if (mode != 0)
			break;
		if (event.altKey) { for (let map of maps) if (map.selected) map.y -= getGridLevel() * (1 + 4*event.shiftKey); }
		else for (let map of maps) if (map.selected) for (let r of map.regions) if (r.selected) for (let p of r.points) p.y -= getGridLevel() * (1 + 4*event.shiftKey);
		break;
	case "ArrowDown":
		if (mode != 0)
			break;
		if (event.altKey) { for (let map of maps) if (map.selected) map.y += getGridLevel() * (1 + 4*event.shiftKey); }
		else for (let map of maps) if (map.selected) for (let r of map.regions) if (r.selected) for (let p of r.points) p.y += getGridLevel() * (1 + 4*event.shiftKey);
		break;
	case " ": // toggle region / add region point
		event.preventDefault();
		if (mode <= 1) {
			for (let i = maps.length-1; i >= 0; i--) if ((mode == 1 || maps[i].selected) && maps[i].isUnderPoint(inp(mouse))) {
				for (let r of maps[i].regions) if (r.isUnderPointFull(mouse)) r.toggle();
				//break;
			}
		} else if (mode == 2) {
			if (!tempRegion) {
				tempRegion = new TTMapRegion({pos: activeMap.pos, space: activeMap.space}, []);
				tempRegion.black = false;
				tempRegion.selected = true;
			}
			
			let point = getGridSnapPoint(inp(mouse).sub(activeMap.pos));
			switch (tempRegion.points.length) {
			case 0:
				corner1 = point;
				break;
			case 1:
				corner2 = point;
				break;
			default:
				corner1 = null, corner2 = null;
				break;
			}
			tempRegion.points.push(point);
		}
		break;
	case "n": // new region
		if (event.metaKey || event.ctrlKey)
			break;
		
		if (mode == 2)
			mode = 0;
		else if (maps.length > 0) {
			mode = 2;
			activeMap = getActiveMap();
			corner1 = null, corner2 = null, tempRegion = null;
		}
		break;
	case "r": // clear new region
		if (event.metaKey || event.ctrlKey)
			break;

		if (mode == 2)
			corner1 = null, corner2 = null, tempRegion = null;
		break;
	case "c": // clear new region
		if (mode == 2)
			corner1 = null, corner2 = null, tempRegion = null;
		break;
	case "1": // plot corner 1
		if (event.metaKey || event.ctrlKey)
			break;
		
		if (mode == 2) {
			corner1 = getGridSnapPoint(inp(mouse).sub(activeMap.pos));
			updateRectTempRegion();
		}
		break;
	case "2": // plot corner 2
		if (event.metaKey || event.ctrlKey)
			break;
		
		if (mode == 2) {
			corner2 = getGridSnapPoint(inp(mouse).sub(activeMap.pos));
			updateRectTempRegion();
		}
		break;
	case "Enter": // commit new region
		if (mode == 2 && tempRegion && tempRegion.points.length >= 3) {
			activeMap.addRegion(tempRegion.points);
			corner1 = null, corner2 = null, tempRegion = null;
		}
		break;
	case "Escape": // exit special modes
		mode = 0;
		corner1 = null, corner2 = null, tempRegion = null;
		break;
	case "i": // import a map image
		if ((event.metaKey || event.ctrlKey) && mode == 0)
			imageInput.click();
		break;
	case "o": // open save file
		if (event.metaKey || event.ctrlKey) {
			event.preventDefault();
			if (maps.length == 0)
				dndmapInput.click();
			else {
				if (event.shiftKey) {
					if (confirm("Do you want to merge a save file into the current session?"))
						dndmapInput.click();
				} else if (confirm("Do you want to open a save file? The current session will be lost.")) {
					clear = true;
					dndmapInput.click();
				}
			}
		}
		break;
	case "s": // save as a .dndmap file
		if (event.metaKey || event.ctrlKey) {
			event.preventDefault();
			if (maps.length > 0)
				saveFile(generateMinSaveData(), "save", "dndmap");
		}
		break;
	case "f":
		if ((event.metaKey || event.ctrlKey) && !event.shiftKey)
			event.preventDefault();
		break;
	}
});

window.addEventListener("keyup", event => {
	keys[event.which || event.keyCode] = false;
});

// handle drag and drop
window.addEventListener("drop", event => {
	event.stopPropagation();
	event.preventDefault();

	let hasReset = false;
	for (let file of event.dataTransfer.files) {
		if (file.type == "text/plain" && confirm("Do you want to open this save file? The current session will be lost.")) {
			if (!hasReset) {
				maps = [];
				hasReset = true;
			}
			loadFile(file);
		} else if (file.type.substring(0, 5) == "image") {
			imageQueue.push(file);
		}
	}
});

// handle file selection via path
imageInput.addEventListener("change", event => {
	imageQueue.push(...imageInput.files);
	imageInput.value = "";
});

dndmapInput.addEventListener("change", event => {
	if (clear)
		maps = [];
	clear = false;

	for (let file of dndmapInput.files)
		loadFile(file);
	dndmapInput.value = "";
});



// From: https://stackoverflow.com/questions/13405129/javascript-create-and-save-file
function saveFile(contents, filename, type) {
    let file = new Blob([contents], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        let a = document.createElement("a"), url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        //document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            //document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

function generateSaveData() {
	return `[\n\t${maps.map(m => m.toJSON(1)).join(", ")}\n]`;
}

function generateMinSaveData() {
	return `[${maps.map(m => m.toMinJSON()).join(",")}]`;
}

function loadFile(file) { // get contents from a file
	let reader = new FileReader();
	reader.onload = function() {
		loadData(reader.result);
	}
	reader.readAsText(file);
}

function loadData(data) { // load maps from save data
	let newMaps = JSON.parse(data);
	for (let mapdata of newMaps) {
		let image = document.createElement("img");
		image.src = mapdata.imgsrc;

		let map = new TTMap(cam, image, mapdata.width, mapdata.height);
		map.pos = new V(mapdata.pos);

		for (let rdata of mapdata.regions) {
			let points = [];
			for (let pdata of rdata.points) {
				points.push(new V(pdata));
			}
			map.addRegion(points, rdata.black);
		}

		maps.push(map);
	}
}




function getGridLevel() {
	for (let i = 0; i < gridLevels.length; i++)
		if (i >= gridLevels.length-1 || outd(gridLevels[i+1]) >= gridZoomThreshold * canvas.width)
			return gridLevels[i];
}

function getGridSnapPoint(point=inp(mouse)) {
	let gridSpacing = getGridLevel();
	return point.mult(1 / gridSpacing).op(round).mult(gridSpacing);
}

function drawTileGrid() {
	ctx.strokeStyle = "#afafaf7f";
	ctx.lineWidth = 1;
	let indexLimit = 3;

	for (let i = 0; i < gridLevels.length; i++) {
		if (i < gridLevels.length-1 && outd(gridLevels[i+1]) < gridZoomThreshold * canvas.width)
			continue;
		let level = gridLevels[i];

		for (let x = ceil(inx(0) / level) * level; x <= floor(inx(canvas.width) / level) * level + SMOL; x += level) {
			ctx.beginPath();
			ctx.moveTo(outx(x), 0);
			ctx.lineTo(outx(x), canvas.height);
			ctx.stroke();
		}

		for (let y = ceil(iny(0) / level) * level; y <= floor(iny(canvas.height) / level) * level + SMOL; y += level) {
			ctx.beginPath();
			ctx.moveTo(0, outy(y));
			ctx.lineTo(canvas.width, outy(y));
			ctx.stroke();
		}

		indexLimit--;
		if (indexLimit <= 0) return;
		ctx.lineWidth++;
	}
}

function getActiveMap() {
	let topSelected = null, topMouse = null;
	for (let i = maps.length-1; i >= 0; i--) {
		let tmp = maps[i].isUnderPoint(inp(mouse));
		if (maps[i].selected) {
			if (!topSelected)
				topSelected = maps[i];
			if (tmp)
				return maps[i];
		}
		if (tmp && !topMouse)
			topMouse = maps[i];
	}

	return topSelected || topMouse || maps[maps.length-1];
}

function updateRectTempRegion() {
	if (!activeMap || !corner1 || !corner2) return;

	if (abs(corner1.x - corner2.x) < SMOL || abs(corner1.y - corner2.y) < SMOL) {
		tempRegion = null;
		return;
	}

	let left = min(corner1.x, corner2.x);
	let right = max(corner1.x, corner2.x);
	let top = min(corner1.y, corner2.y);
	let bottom = max(corner1.y, corner2.y);

	tempRegion = new TTMapRegion({pos: activeMap.pos, space: activeMap.space}, [new V(left, top), new V(right, top), new V(right, bottom), new V(left, bottom)], [left, right, top, bottom]);
	tempRegion.black = false;
	tempRegion.selected = true;
}

function addMap(imageFile) {
	const image = document.createElement("img");
	//image.file = imageFile;

	let response, width, height;
	while (!(width > 0)) {
		response = prompt("Width of map \"" + imageFile.name + "\"");
		if (response == null)
			return;
		width = parseFloat(response);
		
	}
	while (!(height > 0)) {
		response = prompt("Height of map \"" + imageFile.name + "\"");
		if (response == null)
			return;
		height = parseFloat(response);
	}

	const reader = new FileReader();
	reader.onload = event => image.src = event.target.result;
	reader.readAsDataURL(imageFile);

	let map = new TTMap(cam, image, width * 5, height * 5);
	map.pos = getGridSnapPoint(cam.pos);
	maps.push(map);
}



let cam = new LocalSpace(0.125);
function outx(x) { return cam.outx(x); }
function outy(y) { return cam.outy(y); }
function outd(d) { return cam.outd(d); }
function inx(x) { return cam.inx(x); }
function iny(y) { return cam.iny(y); }
function ind(d) { return cam.ind(d); }
function outp(v) { return cam.outp(v); }
function inp(v) { return cam.inp(v); }
function inv(v) { return cam.inv(v); }



let maps = [];
let clear = false;
let grid = true;
let gridZoomThreshold = 0.25;
let gridLevels = [1/192, 1/12, 1, 5, 660, 5280];
let mode = 0;
let activeMap = null, corner1 = null, corner2 = null, tempRegion = null;
let imageQueue = [];
let dragka = false, panka = false;
let dragstart = new V();
let bgcolors = ["#1f1f1f", "#000000", "#1f2f1f"];
let timestampnow = performance.now(), timestampprev = performance.now();
const SMOL = 0.0001;
const SMOL_ANGLE = 0.0001;



function draw() {
	requestAnimationFrame(draw);

	// top image on queue
	if (imageQueue.length > 0)
		addMap(imageQueue.shift());
	


	// wasd pan
	timestampnow = performance.now();
	let delta = timestampnow - timestampprev;
	let m = new V(0, 0), dz = 0;
	if (keys[87]) m.y--;
	if (keys[83]) m.y++;
	if (keys[65]) m.x--;
	if (keys[68]) m.x++;
	if (keys[189]) dz++;
	if (keys[187]) dz--;
	m = m.normalize().mult(delta * cam.z * 0.4);
	cam.pos = cam.pos.add(m);
	cam.pos = cam.pos.add(inv(new V(canvas.width * 0.5, canvas.height * 0.5)));
	cam.z *= 1 + (dz * delta * 0.0005);
	cam.pos = cam.pos.sub(inv(new V(canvas.width * 0.5, canvas.height * 0.5)));
	
	timestampprev = timestampnow;

	// assign an active map if needed
	if (mode == 2 && !activeMap)
		activeMap = getActiveMap();

	
	// background
	ctx.fillStyle = bgcolors[mode];
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// draw maps
	if (mode == 2)
		activeMap.draw(mode);
	else
		for (let map of maps)
			map.draw(mode);

	// draw the tile grid
	if (grid)
		drawTileGrid();

	//if (dragka) { /* update selection preview */ }

	// draw selection box
	if (mode == 0 && dragka) {
		ctx.fillStyle = "#bf1f1f3f";
		ctx.strokeStyle = "#ff3f3fdf";
		ctx.lineWidth = 0.8;
		ctx.fillRect(outx(dragstart.x), outy(dragstart.y), mouse.x - outx(dragstart.x), mouse.y - outy(dragstart.y));
		ctx.strokeRect(outx(dragstart.x), outy(dragstart.y), mouse.x - outx(dragstart.x), mouse.y - outy(dragstart.y));
	}

	// draw region placement preview
	if (mode == 2) {
		if (tempRegion)
			tempRegion.draw();

		function drawX(p, size=1) {
			p = outp(p);
			size = outd(size);
			ctx.beginPath();
			ctx.moveTo(p.x - size, p.y - size);
			ctx.lineTo(p.x + size, p.y + size);
			ctx.moveTo(p.x - size, p.y + size);
			ctx.lineTo(p.x + size, p.y - size);
			ctx.stroke();
		}

		let size = getGridLevel() / 5;

		ctx.lineWidth = 3;
		if (corner1) {
			ctx.strokeStyle = "#00df00";
			drawX(corner1.add(activeMap.pos, size));
		}
		if (corner2) {
			ctx.strokeStyle = "#00dfdf";
			drawX(corner2.add(activeMap.pos, size));
		}
	}

}

requestAnimationFrame(draw);




