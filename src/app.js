const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function loadImage(name) {
	const image = new Image();
	image.src = "img/" + name + ".png";
	return image;
}

const mamaCloud = loadImage("mama cloud");
mamaCloud.currentX = 100;

const weeCloud = loadImage("wee cloud");
weeCloud.currentX = 400;

const fencePostsImage = loadImage("fence");
const firstFencePostOriginX = 6;
const fencePostSpacing = 6;
const fencePostY = 840;

const skySpacing = 140;
const onesSkySlotsY = 400;
const tensSkySlotsY = 1750;

let birdImages = [];
for (let birdImageIndex = 0; birdImageIndex < 10; birdImageIndex++) {
	const birdImage = loadImage("peep animation/peep_0" + birdImageIndex);
	birdImages.push(birdImage);
}
let birdSittingImage = loadImage("peep sit");


let skySpots = [];
for (let skySpotsIndex = 0; skySpotsIndex < 20; skySpotsIndex++) {
	skySpots.push(false);
}


class Counter {
	constructor(x, y, actionString) {
		this.currentX = x;
		this.currentY = y;
		this.targetX = x;
		this.targetY = y;
		this.height = 70;
		this.opacity = 1.0;
		this.actionString = actionString;
		this.enabled = true;
	}

	set value(newValue) {
		this._value = newValue;

		ctx.save();
		ctx.font = Counter.numberFont();
		this.textMetrics = ctx.measureText(newValue);
		ctx.restore();

		const birdString = this.value === 1 ? "bird" : "birds";
		this.descriptionString = birdString + " " + this.actionString;

		this.width = newValue >= 10 ? 80 : 55;
	}

	get value() {
		return this._value;
	}

	static numberFont() {
		return "200 60px 'Proxima Nova'";
	}

	update() {
		const opacitySpeed = 0.4;
		const targetOpacity = this.enabled ? 1.0 : 0.0;
		this.opacity = this.opacity * (1.0 - opacitySpeed) + targetOpacity * opacitySpeed;

		const positionSpeed = 0.06;
		this.currentX = this.currentX * (1.0 - positionSpeed) + this.targetX * positionSpeed;
		this.currentY = this.currentY * (1.0 - positionSpeed) + this.targetY * positionSpeed;

		this.x = this.currentX;
		this.y = this.currentY;
	}

	draw() {
		ctx.save();
		ctx.globalAlpha = this.opacity;

		const counterPadding = 13;
		const cornerRadius = 5;

		const originX = Math.floor(this.x - this.width - counterPadding);
		const originY = Math.floor(this.y - this.height / 2.0);

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
		ctx.fillStyle = "rgba(40, 59, 66, 0.33)"; // white 70%
		ctx.fill();
		ctx.restore();

		ctx.save();
		ctx.fillStyle = "white";

		ctx.font = Counter.numberFont();
		ctx.fillText(this.value, originX + (this.width - this.textMetrics.width) / 2.0, originY + this.height - counterPadding);

		ctx.font = "200 44px 'Proxima Nova'";
		const birdString = this.value === 1 ? "bird" : "birds"
		ctx.fillText(this.descriptionString, originX + this.width + 10, originY + this.height - 14);
		ctx.restore();

		ctx.restore();
	}
}

class BirdsFlyingCounter extends Counter {
	constructor(x, y) {
		super(x, y, "flying");
		this.floatOffsetX = 0;
		this.floatOffsetY = 0;
	}

	update() {
		super.update();

		this.floatOffsetX += Math.sin(Date.now() / 3000) * 0.1;
		this.floatOffsetY += Math.sin(Date.now() / 1800) * 0.3;

		const scrollingOffset = (currentStage === "ones") ? 0 : Math.max(0, window.scrollY - this.targetY + 150);

		this.x = this.currentX + this.floatOffsetX;
		this.y = this.currentY + scrollingOffset + this.floatOffsetY;
	}

	draw() {
		super.draw();
	}
}

class TotalCounter extends Counter {
	constructor(x, y) {
		super(x, y, "total");
	}

	update() {
		super.update();
		// this.y = window.scrollY + window.innerHeight - 100;
	}

	draw() {
		super.draw();

		ctx.save();
		ctx.beginPath();
		ctx.moveTo(this.x - this.width/2.0 - 80, this.y - this.height/2.0 - 30);
		ctx.lineTo(this.x + 240 /* so lazy */, this.y - this.height/2.0 - 30);
		ctx.lineWidth = 3;
		ctx.lineCapStyle = "round";
		ctx.strokeStyle = "white";
		ctx.stroke();
		ctx.restore();
	}
}


function updateCounterValues() {
	birdsFlyingCounter.value = birds.filter((bird) => { return bird.flying === true }).length;
	fencePostCounter.value = posts.filter((post) => { return post.bird !== null }).length;
	totalCounter.value = birdsFlyingCounter.value + fencePostCounter.value;
}
let birdsFlyingCounter = new BirdsFlyingCounter(1100, onesSkySlotsY);
let fencePostCounter = new Counter(1100, 800, "sitting");
let totalCounter = new TotalCounter(1100, 1000);


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

	static height() {
		return birdImages[0].height;
	}

	update() {
		const speed = 0.1;
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

class Post {
	constructor(originX, originY) {
		this.originX = originX;
		this.originY = originY;
		this.height = 182;
		this.bird = null;
	}

	static width() {
		return 70;
	}

	static height() {
		return 182;
	}

	static highlightImage() {
		if (this._highlightImage === undefined) {
			this._highlightImage = loadImage("fence post brightener");
		}
		return this._highlightImage;
	}

	update() {
		if (Mouse.pressed) {
			this.pressed = (Mouse.x > this.originX) && (Mouse.x <= this.originX + Post.width()) && (Mouse.y > this.originY) && (Mouse.y <= this.originY + Post.height());
		} else if (this.pressed && !Mouse.pressed) {
			if (this.bird !== null) {
				var availableSkySpotIndex = skySpots.findIndex((el) => { return el === false });

				// TODO abstract magic numbers
				this.bird.targetX = 100 + availableSkySpotIndex * skySpacing;
				this.bird.targetY = onesSkySlotsY;
				this.bird.flying = true;
				this.bird.positionIndex = availableSkySpotIndex;

				skySpots[availableSkySpotIndex] = true;
				this.bird = null;
			} else {
				// Find a flying bird; make it fly here.
				for (var bird of birds) {
					if (bird.flying) {
						this.bird = bird;

						bird.targetX = this.originX + Post.width() / 2.0;
						bird.targetY = this.originY - 15;
						skySpots[bird.positionIndex] = false;
						bird.flying = false;
						break;
					}
				}
			}

			this.pressed = false;
		}
		this.lastPressed = Mouse.pressed;
	}

	draw() {
		if (this.pressed) {
			ctx.save();
			ctx.globalAlpha = 0.5;
			ctx.drawImage(Post.highlightImage(), this.originX, this.originY);
			ctx.restore();
		}
	}
}

class Wave {
	static images() {
		if (this._images === undefined) {
			this._images = [loadImage("wave 1"), loadImage("wave 2")];
		}
		return this._images;
	}

	constructor(x, y, imageIndex) {
		this.initialX = x;
		this.initialY = y;
		this.imageIndex = imageIndex;
		this.frequency = 1000 + (Math.random() % 1000);
		this.amplitudeX = 25
		this.amplitudeY = 10
	}

	update() {
		this.x = Math.sin(Date.now() / this.frequency) * this.amplitudeX + this.initialX;
		this.y = Math.cos(Date.now() / this.frequency) * this.amplitudeY + this.initialY;
	}

	draw() {
		ctx.drawImage(Wave.images()[this.imageIndex], this.x, this.y);
	}
}

class ScrollDownArrow {
	static image() {
		if (this._image === undefined) {
			this._image = loadImage("chubby arrow");
		}
		return this._image;
	}

	static centerX() {
		return 850;
	}

	constructor(y) {
		this.initialY = y;
		this.enabled = false;
		this.alpha = 0;
		this.targetAlpha = 0;
	}

	update() {
		this.x = ScrollDownArrow.centerX();
		this.y = this.initialY + Math.sin(Date.now() / 1000) * 25;

		const targetAlpha = this.enabled ? 1.0 : 0.0;
		const alphaSpeed = 0.2;
		this.targetAlpha = this.targetAlpha * (1.0 - alphaSpeed) + targetAlpha * alphaSpeed;
		this.alpha = this.targetAlpha * (1.0 - Math.min(1.0, Math.max(0.0, (window.scrollY - (this.initialY - ScrollDownArrow.image().height / 2.0)) / 100.0)));
	}

	draw() {
		let image = ScrollDownArrow.image();

		ctx.save();
		ctx.globalAlpha = this.alpha;
		ctx.drawImage(image, this.x - image.width / 2.0, this.y - image.height / 2.0);
		ctx.restore();
	}
}

class Hill {
	constructor(x, y, imageName) {
		this.x = x;
		this.y = y;
		this.image = loadImage(imageName);
	}

	draw() {
		ctx.drawImage(this.image, this.x, this.y);
	}
}

class PowerLine {
	static highlightImage() {
		if (this._highlightImage === undefined) {
			this._highlightImage = loadImage("power line brightener");
		}
		return this._highlightImage;
	}

	constructor(centerX, centerY, radius, firstDotX, firstDotY, secondDotX, secondDotY, beamX, beamY) {
		this.centerX = centerX;
		this.centerY = centerY;
		this.radius = radius;

		// In math, unlike in drawing, +y is up.
		const firstDotAngle = Math.atan2(this.centerY - firstDotY, firstDotX - this.centerX);
		const secondDotAngle = Math.atan2(this.centerY - secondDotY, secondDotX - this.centerX);
		const dotSpacingAngle = secondDotAngle - firstDotAngle;

		this.dotPoints = new Array(10);
		for (let dotIndex = 0; dotIndex < 10; dotIndex++) {
			// The dots aren't actually spaced in even arc lengths along X. They're on the edge of a circle but spaced in even X amounts.
			const dotX = firstDotX + (secondDotX - firstDotX) * dotIndex;
			const dotY = this.centerY - this.radius * Math.sin(firstDotAngle + dotIndex * dotSpacingAngle);
			this.dotPoints[dotIndex] = [dotX, dotY];
		}

		this.beamX = beamX;
		this.beamY = beamY;

		this.debugDrawing = false;
	}

	update() {
		if (Mouse.pressed) {
			this.pressed = (Mouse.x > this.beamX) && (Mouse.x <= this.beamX + PowerLine.highlightImage().width) && (Mouse.y > this.beamY) && (Mouse.y <= this.beamY + PowerLine.highlightImage().height);
		} else if (this.pressed && !Mouse.pressed) {
			this.pressed = false;
		}
		this.lastPressed = Mouse.pressed;
	}

	draw() {
		if (this.debugDrawing) {
			ctx.save();
			ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
			ctx.beginPath();
			ctx.ellipse(this.centerX, this.centerY, this.radius, this.radius, 0, 0, 2 * Math.PI);
			ctx.fill();
			ctx.restore();

			for (let dotPoint of this.dotPoints) {
				ctx.save();
				ctx.fillStyle = "red";
				ctx.beginPath()
				ctx.ellipse(dotPoint[0], dotPoint[1], 2, 2, 0, 0, 2 * Math.PI);
				ctx.fill();
				ctx.restore();
			}
		}

		if (this.pressed) {
			ctx.save();
			ctx.globalAlpha = 0.5;
			ctx.drawImage(PowerLine.highlightImage(), this.beamX, this.beamY);
			ctx.restore();
		}
	}
}

let birds = [];

let posts = [];
for (let postIndex = 0; postIndex < 9; postIndex++) {
	posts.push(new Post(firstFencePostOriginX + postIndex * (Post.width() + fencePostSpacing), fencePostY))
}

let waves = [
	new Wave(86, 1730, 0),
	new Wave(126, 1770, 1),
	new Wave(106, 1800, 0),
	new Wave(86, 1830, 1)
];

const hills = [
	new Hill(0, 983, "hill 3"),
	new Hill(0, 1492, "hill 4"),
	new Hill(260, 1731, "hill 5"),
	new Hill(0, 1882, "hill 6"),
	new Hill(0, 2755, "hill 7"),
	new Hill(244, 2825, "hill 8")
];
const powerLineImage = loadImage("power lines")

const powerLines = [
	new PowerLine(755, -367, 1788.5, 298.5, 1363, 374.5, 1381, 27, 1323),
	new PowerLine(755, -295, 1788.5, 298.5, 1435, 374.5, 1453, 27, 1393),
	new PowerLine(755, -223, 1788.5, 298.5, 1507, 374.5, 1525, 27, 1463)
];

const scrollDownArrow = new ScrollDownArrow(980);


let currentStage;
setCurrentStage("ones");

function goToNextStage() {
	switch (currentStage) {
	case "ones":
		setCurrentStage("transition-to-tens");
		break;
	case "transition-to-tens":
		setCurrentStage("tens");
		break;
	default:
		throw "Unknown stage";
	}
}

function setCurrentStage(newStage) {
	switch (newStage) {
	case "transition-to-tens":
		for (var birdIndex = birds.length; birdIndex < 10; birdIndex++) {
			addBird();
		}
		scrollDownArrow.enabled = true;
		break;
	case "tens":
		for (var bird of birds)	{
			bird.flying = true;
			bird.targetY = tensSkySlotsY;
		}

		posts = []
		birdsFlyingCounter.targetY = tensSkySlotsY;
		totalCounter.targetY = 2100;
		fencePostCounter.enabled = false;
	}
	currentStage = newStage;
}


function addBird() {
	const bird = new Bird(-Bird.width(), onesSkySlotsY);
	bird.positionIndex = skySpots.findIndex((el) => { return el === false });
	bird.targetX = 100 + bird.positionIndex * skySpacing;
	birds.push(bird);
	skySpots[bird.positionIndex] = true;
}


let dateWhenSkyEmptied = null;
function drawScene() {
	mamaCloud.currentX -= 0.3
	if (mamaCloud.currentX < -(mamaCloud.width + 100)) {
		mamaCloud.currentX = canvas.width;
	}

	weeCloud.currentX -= 0.5
	if (weeCloud.currentX < -(weeCloud.width + 100)) {
		weeCloud.currentX = canvas.width;
	}

	ctx.clearRect(0,0,canvas.width,canvas.height);

	ctx.drawImage(mamaCloud, mamaCloud.currentX, 200);
	ctx.drawImage(weeCloud, weeCloud.currentX, 300);

	ctx.drawImage(fencePostsImage, 0, 796);

	for (var post of posts) {
		post.update();
		post.draw();
	}

	hills[0].draw();
	for (var wave of waves) {
		wave.update();
		wave.draw();
	}
	for (var hill of hills.slice(1)) {
		hill.draw();
	}

	ctx.drawImage(powerLineImage, 0, 1248);

	for (var bird of birds) {
		bird.update();
		bird.draw();
	}

	const numberOfBirdsInSky = skySpots.filter((el) => { return el === true }).length;
	if (numberOfBirdsInSky === 0 && currentStage === "ones") {
		if (birds.length === 0 || Date.now() - dateWhenSkyEmptied > 500) {
			addBird();
			if (birds.length >= 10) {
				goToNextStage();
			}
			dateWhenSkyEmptied = null;
		} else if (dateWhenSkyEmptied === null) {
			dateWhenSkyEmptied = Date.now();
		}
	}

	scrollDownArrow.update();
	scrollDownArrow.draw();

	updateCounterValues();
	birdsFlyingCounter.update();
	birdsFlyingCounter.draw();
	fencePostCounter.update();
	fencePostCounter.draw();

	totalCounter.update();
	totalCounter.draw();

	for (var powerLine of powerLines) {
		powerLine.update();
		powerLine.draw();
	}

	if (currentStage === "transition-to-tens") {
		if (fencePostCounter.y - birdsFlyingCounter.y < 120) {
			goToNextStage();
		}
	}
}


window.requestAnimFrame = window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	function(callback) { window.setTimeout(callback, 1000/60); };
	(function animloop(){
		requestAnimFrame(animloop);
		drawScene();
	})();
