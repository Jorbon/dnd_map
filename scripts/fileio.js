// File IO
const imageInput = document.getElementById("image-input")
const dndmapInput = document.getElementById("dndmap-input")
window.addEventListener("contextmenu", event => { event.stopPropagation(); event.preventDefault() })
window.addEventListener("dragenter", event => { event.stopPropagation(); event.preventDefault() })
window.addEventListener("dragover", event => { event.stopPropagation(); event.preventDefault() })

// handle drag and drop
window.addEventListener("drop", event => {
	event.stopPropagation()
	event.preventDefault()
	
	for (let file of event.dataTransfer.files) {
		if (file.type == "text/plain") loadFile(file)
		else if (file.type.substring(0, 5) == "image") imageLoadQueue.push(file)
	}
})

// handle file selection via path
imageInput.addEventListener("change", event => {
	imageLoadQueue.push(...imageInput.files)
	imageInput.value = ""
})

dndmapInput.addEventListener("change", event => {
	for (let file of dndmapInput.files) loadFile(file)
	dndmapInput.value = ""
})

// From: https://stackoverflow.com/questions/13405129/javascript-create-and-save-file
function saveFile(contents, filename, type) {
    let file = new Blob([contents], {type: type})
    if (window.navigator.msSaveOrOpenBlob) window.navigator.msSaveOrOpenBlob(file, filename)
    else {
        let a = document.createElement("a")
		let url = URL.createObjectURL(file)
        a.href = url
        a.download = filename
        a.click()
        setTimeout(function() { window.URL.revokeObjectURL(url) }, 0)
    }
}

function generateSaveData() {
	return `{"images":[${images.join(",")}],"fogs":[${fogs.join(",")}]}`
}

function loadFile(file) {
	let reader = new FileReader()
	reader.onload = function() {
		let data = JSON.parse(reader.result)
		let newImages = [], newFogs = []
		let minY = 1e9
		let newfog
		
		for (let mapimage of data.images) {
			let image = document.createElement("img")
			image.src = mapimage.src
			newImages.push(new MapImage(image, mapimage.x, mapimage.y, mapimage.width, mapimage.height))
			if (mapimage.y < minY) minY = mapimage.y
		}
		
		for (let fog of data.fogs) {
			if (fog.path) {
				newfog = new Fog()
				for (let p of fog.path) {
					newfog.path.push(new Vec2(p[0], p[1]))
					if (p[1] < minY) minY = p[1]
				}
			} else {
				newfog = new FogRect(fog.left, fog.top, fog.right, fog.bottom)
				if (fog.top < minY) minY = fog.top
			}
			newfog.active = fog.active
			newFogs.push(newfog)
		}
		
		let maxY = -1e9
		for (let image of images) if (image.y > maxY) maxY = image.y
		for (let fog of fogs) {
			if (fog instanceof FogRect) {
				if (fog.bottom > maxY) maxY = fog.bottom
			} else for (let p of fog.path) {
				if (p.y > maxY) maxY = p.y
			}
		}
		
		let move = maxY - minY + 10
		if (move > 0) {
			for (let image of images) image.y += move
			for (let fog of newFogs) {
				if (fog instanceof FogRect) {
					fog.top += move
					fog.bottom += move
				} else {
					for (let p of fog.path) p.y += move
				}
			}
		}
		
		for (let image of newImages) images.push(image)
		for (let fog of newFogs) fogs.push(fog)
	}
	reader.readAsText(file)
}

function loadImage(imageFile) {
	const image = document.createElement("img")
	//image.file = imageFile
	
	let response, width = 0, height = 0
	while (width <= 0) {
		response = prompt(`Width of map "${imageFile.name}"`)
		if (response == null) return
		width = parseFloat(response)
	}
	while (height <= 0) {
		response = prompt(`Height of map "${imageFile.name}"`)
		if (response == null) return
		height = parseFloat(response)
	}
	
	const reader = new FileReader()
	reader.onload = event => { image.src = event.target.result }
	reader.readAsDataURL(imageFile)
	
	let point = getGridSnapPoint(view)
	images.push(new MapImage(image, point.x, point.y, width * 5, height * 5))
}
