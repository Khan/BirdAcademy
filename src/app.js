const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.font = "200 60px 'Proxima Nova'";

function loadImage(name) {
	const image = new Image();
	image.src = "img/" + name + ".png";
	return image;
}

const mamaCloud = loadImage("mama cloud");
mamaCloud.currentX = 100;

const weeCloud = loadImage("wee cloud");
weeCloud.currentX = 400;

const fencePosts = loadImage("fence");
const firstFencePostX = 32;
const fencePostSpacing = 77;
const fencePostY = 750;

const skySpacing = 140;

let birdImages = [];
for (let birdImageIndex = 0; birdImageIndex < 10; birdImageIndex++) {
	const birdImage = loadImage("peep animation/peep_0" + birdImageIndex);
	birdImages.push(birdImage);
}
let birdSittingImage = loadImage("peep sit");

let fenceSpots = [];
for (let fencePostIndex = 0; fencePostIndex < 9; fencePostIndex++) {
	fenceSpots.push(false);
}

let skySpots = [];
for (let skySpotsIndex = 0; skySpotsIndex < 20; skySpotsIndex++) {
	skySpots.push(false);
}


class Counter {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.width = 55;
		this.height = 70;
	}

	set value(newValue) {
		this._value = newValue;
		this.textMetrics = ctx.measureText(newValue);
	}

	get value() {
		return this._value;
	}

	draw() {
		const counterPadding = 13;
		const cornerRadius = 5;

		const originX = this.x - this.width / 2.0 - counterPadding;
		const originY = this.y - this.height / 2.0;

		// Make a round rect...
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(originX + cornerRadius, originY);
		ctx.lineTo(originX + this.width - cornerRadius, originY);
		ctx.arcTo(originX + this.width, originY, originX + this.width, originY + cornerRadius, cornerRadius);
		ctx.lineTo(originX + this.width, originY + this.height - cornerRadius);
		ctx.arcTo(originX + this.width, originY + this.height, originX + this.width - cornerRadius, originY + this.height, cornerRadius);
		ctx.lineTo(originX + cornerRadius, originY + this.height);
		ctx.arcTo(originX, originY + this.height, originX, originY + this.height - cornerRadius, cornerRadius);
		ctx.lineTo(originX, originY + cornerRadius);
		ctx.arcTo(originX, originY, originX + cornerRadius, originY, cornerRadius);
		ctx.globalCompositeOperation = "multiply";
		ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
		ctx.shadowBlur = 30;
		ctx.fillStyle = "rgba(255, 255, 255, 0.7)"; // white 70%
		ctx.fill();
		ctx.restore();

		ctx.save();
		ctx.fillStyle = "#253441";
		ctx.fillText(this.value, originX + (this.width - this.textMetrics.width) / 2.0, originY + this.height - counterPadding);
		ctx.restore();
	}
}



let skyCounter = new Counter(1100, 125);
skyCounter.value = 5;

let fencePostCounter = new Counter(1100, 650);
fencePostCounter.value = 0;


let someBirdIsBeingDragged = false;
class Bird {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.targetX = this.x;
		this.targetY = this.y;
		this.flying = true;
		this.phase = Math.random() % (2 * Math.PI);
		this.frequencyX = 800 + Math.random() % 200;
		this.frequencyY = 600 + Math.random() % 150;
		this.animationIndex = Math.floor(Math.random() % birdImages.length);
	}

	static width() {
		return birdImages[0].width;
	}

	static hitBoxWidth() { return 62; }
	static hitBoxHeight() { return 72; }

	static height() {
		return birdImages[0].height;
	}

	update() {
		if (!this.dragged) {
			if (Mouse.pressed && !this.lastPressed && !someBirdIsBeingDragged) {
				const dx = Mouse.x - this.x;
				const dy = Mouse.y - this.y;
				if (Math.abs(dx) < Bird.hitBoxWidth() / 2.0 && Math.abs(dy) < Bird.hitBoxHeight() / 2.0) {
					this.dragged = true;
					someBirdIsBeingDragged = true;
				}
			}
		} else {
			if (!Mouse.pressed) {
				if (this.flying) {
					var availableFencePostIndex = fenceSpots.findIndex((el) => { return el === false });
					console.log(availableFencePostIndex);
					skySpots[this.positionIndex] = false
					fenceSpots[availableFencePostIndex] = true;
					this.positionIndex = availableFencePostIndex;

					this.targetX = firstFencePostX + availableFencePostIndex * fencePostSpacing;
					this.targetY = fencePostY - Bird.height() / 2.0;
					this.flying = false;

					fencePostCounter.value++;
					skyCounter.value--;
				} else {
					var availableSkySpotIndex = skySpots.findIndex((el) => { return el === false });
					console.log(availableSkySpotIndex);
					this.targetX = 100 + availableSkySpotIndex * skySpacing;
					this.targetY = 100;
					this.flying = true;

					fenceSpots[this.positionIndex] = false;
					skySpots[availableSkySpotIndex] = true;
					this.positionIndex = availableSkySpotIndex;

					fencePostCounter.value--;
					skyCounter.value++;
				}

				someBirdIsBeingDragged = false;
				this.dragged = false;
			}
		}

		this.lastPressed = Mouse.pressed

		const speed = 0.15;
		this.x = this.x * (1.0 - speed) + this.targetX * speed;
		this.y = this.y * (1.0 - speed) + this.targetY * speed;

		if (this.flying) {
			this.x += Math.sin(Date.now() / this.frequencyX + this.phase) * 5
			this.y += Math.sin(Date.now() / this.frequencyY + this.phase) * 3
		}
	}

	draw() {
		let image;
		if (!this.flying && Math.abs(this.x - this.targetX) < 0.1 && Math.abs(this.y - this.targetY) < 0.1) {
			image = birdSittingImage;
		} else {
			image = birdImages[this.animationIndex];
		}

		ctx.drawImage(image, this.x - Bird.width() / 2.0, this.y - Bird.height() / 2.0);
		this.animationIndex = (this.animationIndex + 1) % birdImages.length
	}
}


let birds = [];
for (let birdIndex = 0; birdIndex < 5; birdIndex++) {
	const bird = new Bird(100 + birdIndex * skySpacing, 100);
	bird.positionIndex = birdIndex;
	birds.push(bird);
	skySpots[birdIndex] = true;
}

window.render = () => {
	mamaCloud.currentX -= 0.3
	if (mamaCloud.currentX < -(mamaCloud.width + 100)) {
		mamaCloud.currentX = canvas.width;
	}

	weeCloud.currentX -= 0.5
	if (weeCloud.currentX < -(weeCloud.width + 100)) {
		weeCloud.currentX = canvas.width;
	}

	ctx.clearRect(0,0,canvas.width,canvas.height);

	ctx.drawImage(mamaCloud, mamaCloud.currentX, 50);
	ctx.drawImage(weeCloud, weeCloud.currentX, 150);

	ctx.drawImage(fencePosts, 0, 0);

	for (var bird of birds) {
		bird.update();
		bird.draw();
	}

	skyCounter.draw();
	fencePostCounter.draw();
}


window.requestAnimFrame = window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	function(callback) { window.setTimeout(callback, 1000/60); };
	(function animloop(){
		requestAnimFrame(animloop);
		render();
	})();
