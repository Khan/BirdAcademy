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

const fencePosts = loadImage("fence");
const firstFencePostOriginX = 6;
const fencePostSpacing = 6;
const fencePostY = 840;

const skySpacing = 140;
const skySlotsY = 400;

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
		this.x = x;
		this.y = y;
		this.width = 55;
		this.height = 70;

		this.actionString = actionString;
	}

	set value(newValue) {
		this._value = newValue;

		ctx.save();
		ctx.font = Counter.numberFont();
		this.textMetrics = ctx.measureText(newValue);
		ctx.restore();

		const birdString = this.value === 1 ? "bird" : "birds";
		this.descriptionString = birdString + " " + this.actionString;
	}

	get value() {
		return this._value;
	}

	static numberFont() {
		return "200 60px 'Proxima Nova'";
	}

	draw() {
		const counterPadding = 13;
		const cornerRadius = 5;

		const originX = Math.floor(this.x - this.width / 2.0 - counterPadding);
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
		ctx.fillStyle = "rgba(0, 0, 0, 0.33)"; // white 70%
		ctx.fill();
		ctx.restore();

		ctx.save();
		ctx.fillStyle = "white";

		ctx.font = "200 60px 'Proxima Nova'";
		ctx.fillText(this.value, originX + (this.width - this.textMetrics.width) / 2.0, originY + this.height - counterPadding);

		ctx.font = "200 44px 'Proxima Nova'";
		const birdString = this.value === 1 ? "bird" : "birds"
		ctx.fillText(this.descriptionString, originX + this.width + 10, originY + this.height - 14);
		ctx.restore();
	}
}


function updateCounterValues() {
	skyCounter.value = skySpots.filter((el) => { return el === true }).length;
	fencePostCounter.value = posts.filter((post) => { return post.bird !== null }).length;
}
let skyCounter = new Counter(1050, skySlotsY, "flying");
let fencePostCounter = new Counter(1050, 800, "sitting");


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
				this.bird.targetY = skySlotsY;
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

			updateCounterValues();

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


let birds = [];
for (let birdIndex = 0; birdIndex < 5; birdIndex++) {
	const bird = new Bird(100 + birdIndex * skySpacing, skySlotsY);
	bird.positionIndex = birdIndex;
	birds.push(bird);
	skySpots[birdIndex] = true;
}

let posts = [];
for (let postIndex = 0; postIndex < 9; postIndex++) {
	posts.push(new Post(firstFencePostOriginX + postIndex * (Post.width() + fencePostSpacing), fencePostY))
}

updateCounterValues();

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

	ctx.drawImage(mamaCloud, mamaCloud.currentX, 200);
	ctx.drawImage(weeCloud, weeCloud.currentX, 300);

	ctx.drawImage(fencePosts, 0, 0);

	for (var post of posts) {
		post.update();
		post.draw();
	}

	for (var bird of birds) {
		bird.update();
		bird.draw();
	}

	skyCounter.x += Math.sin(Date.now() / 3000) * 0.1;
	skyCounter.y += Math.sin(Date.now() / 1800) * 0.3;
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
