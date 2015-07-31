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
const firstFencePostX = 643;
const fencePostSpacing = 78;
const fencePostY = 695;

class Bird {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.targetX = this.x;
		this.targetY = this.y;
		this.width = 50;
		this.height = 50;
		this.flying = true;
	}

	update() {
		if (!this.dragged) {
			if (Mouse.pressed && !this.lastPressed) {
				const dx = Mouse.x - this.x;
				const dy = Mouse.y - this.y;
				if (Math.abs(dx) < this.width / 2.0 && Math.abs(dy) < this.height / 2.0) {
					this.dragged = true;
				}
			}
		} else {
			if (!Mouse.pressed) {
				if (this.flying) {
					this.targetX = firstFencePostX;
					this.targetY = fencePostY - this.height / 2.0;
					this.flying = false;
				} else {
					this.targetX = 100;
					this.targetY = 100;
					this.flying = true;
				}
				this.dragged = false;
			}
		}

		this.lastPressed = Mouse.pressed

		const speed = 0.15;
		this.x = this.x * (1.0 - speed) + this.targetX * speed;
		this.y = this.y * (1.0 - speed) + this.targetY * speed;

		if (this.flying) {
			this.x += Math.sin(Date.now() / 1000) * 5
			this.y += Math.sin(Date.now() / 1250) * 3
		}
	}

	draw() {
		ctx.save();
		ctx.beginPath();
		ctx.ellipse(this.x, this.y, this.width / 2.0, this.height / 2.0, 0, 0, 2 * Math.PI)
		ctx.fill();
		ctx.restore();
	}
}

const bird = new Bird(100, 100);

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

	bird.update();
	bird.draw();
}


window.requestAnimFrame = window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	function(callback) { window.setTimeout(callback, 1000/60); };
	(function animloop(){
		requestAnimFrame(animloop);
		render();
	})();
