/**

This is code for a hackathon.

It is full of hacks.

Forgive me.

<3 Andy

**/

class Jukebox {
    static postClipLength() {
        return 3.583;
    }

    static postTimings() {
        return [
            0,
            0.667,
            0.883,
            1.290,
            1.718,
            2.004,
            2.140,
            2.403,
            2.601
        ]
    }

    constructor() {
        const soundsPath = "sound/";
        const soundsExtension = ".mp3";
        const samples = {};

        this.powerLineSampleNames = [];
        for (let powerLineIndex = 0; powerLineIndex < 3; powerLineIndex++) {
            const sampleName = `lines${powerLineIndex + 1}`;
            this.powerLineSampleNames.push(sampleName);
            samples[sampleName] = `${soundsPath}${sampleName}${soundsExtension}`;
        }

        this.postSampleNames = [];
        for (let postIndex = 0; postIndex < 9; postIndex++) {
            const sampleName = `posts${postIndex + 1}`;
            this.postSampleNames.push(sampleName);
            samples[sampleName] = `${soundsPath}${sampleName}${soundsExtension}`;
        }

        blip.sampleLoader()
            .samples(samples)
            .done(() => {
                this.done = true;
                this.loop = blip.loop();
                this.loop
                    .tickInterval(Jukebox.postClipLength())
                    .each((time, iteration) => {
                        this.postSounds = this.postSampleNames.map((sampleName) => {
                            return blip.clip().sample(sampleName);
                        });
                        this.powerLineSounds = this.powerLineSampleNames.map((sampleName) => {
                            return blip.clip().sample(sampleName);
                        });

                        this.loopTime = time;
                        this.update(true);

                        for (let postEntry of this.postSounds.entries()) {
                            postEntry[1].play(time + Jukebox.postTimings()[postEntry[0]]);
                        }
                        for (let powerLineEntry of this.powerLineSounds.entries()) {
                            powerLineEntry[1].play(time + (powerLineEntry[0] > 0 ? Jukebox.postClipLength() : 0));
                        }
                    });
                this.looping = false;
            })
            .load();
    }

    update(fromLoop) {
        let shouldLoop = false;
        const posts = (onesPosts.length > 0) ? onesPosts : combinedPosts;
        for (var i = 0; i < posts.length; i++) {
            let hasSingingBird = (posts[i].bird !== null) && posts[i].bird.singing;
            shouldLoop = (shouldLoop || hasSingingBird);
        }

        let basePowerLineIndex = null;
        switch (currentStage) {
            case "transition-to-combined":
            case "tens":
                basePowerLineIndex = 0;
                break;
            case "combined":
            case "complete":
                basePowerLineIndex = 3;
                break;
        }

        let numberOfPhrases = 1;
        for (var powerLineIndex = 0; powerLineIndex < 3; powerLineIndex++) {
            if (basePowerLineIndex !== null) {
                const powerLine = powerLines[basePowerLineIndex + powerLineIndex];
                shouldSing = powerLine.birds.length === 10 && powerLine.birds[0].singing;
                if (shouldSing) {
                    numberOfPhrases = 2;
                }
                shouldLoop = (shouldLoop || shouldSing);
            }
        }
        this.loop.tickInterval(Jukebox.postClipLength() * numberOfPhrases);

        const oldLooping = this.looping;
        this.looping = shouldLoop;
        if (oldLooping && !shouldLoop) {
            this.loop.stop();
            return;
        } else if (!oldLooping && shouldLoop && fromLoop !== true) {
            this.loop.start();
            return;
        }

        const maxGain = 0.5;

        for (let postEntry of this.postSounds.entries()) {
            const postIndex = postEntry[0];
            if (posts.length > 0) {
                let hasSingingBird = (posts[postIndex].bird !== null) && posts[postIndex].bird.singing;
                postEntry[1].gain(hasSingingBird ? maxGain : 0);
            } else {
                postEntry[1].gain(0);
            }
        }

        for (var powerLineIndex = 0; powerLineIndex < 3; powerLineIndex++) {
            let shouldSing = 0;
            if (basePowerLineIndex !== null) {
                const powerLine = powerLines[basePowerLineIndex + powerLineIndex];
                shouldSing = powerLine.birds.length === 10 && powerLine.birds[0].singing;
            }
            this.powerLineSounds[powerLineIndex].gain(shouldSing ? maxGain : 0);
        }
    }
}

let jukebox = new Jukebox();

const canvas = {
    width: 1366,
    height: 3400,
};
const rootContainer = document.getElementById("bird-academy-container");

function loadImage(name) {
    const image = new Image();
    image.src = "img/" + name + ".png";
    return image;
}

const mamaCloud = document.getElementById("mama-cloud");
mamaCloud.currentX = 100;

const weeCloud = document.getElementById("wee-cloud");
weeCloud.currentX = 400;

const firstFencePostOriginX = 6;
const fencePostSpacing = 6;
const onesFencePostY = 725;
const combinedFencePostY = 2570;

const skySpacing = 120;
const onesSkySlotsY = 290;
const tensSkySlotsY = 1566;
const combinedSkySlotsY = 2415;
let skySlotsY = onesSkySlotsY;

const skySpots = [];
for (let skySpotsIndex = 0; skySpotsIndex < 50; skySpotsIndex++) {
    skySpots.push(false);
}

let suppressNextBirdSequence = false;

class Counter {
    constructor(y, actionString) {
        this.canvas = document.createElement("canvas");
        this.canvas.width = 350;
        this.canvas.height = 100;
        this.canvas.style.position = "absolute";
        setTransform(this.canvas, "translateZ(0)");
        rootContainer.appendChild(this.canvas);
        this.context = this.canvas.getContext("2d");

        const counterX = 1080;
        this.currentX = counterX;
        this.currentY = y;
        this.targetX = counterX;
        this.targetY = y;
        this.height = 70;
        this.opacity = 1.0;
        this.actionString = actionString;
        this.enabled = true;
        this.scale = 1.0;
        this.needsDisplay = true;
    }

    setValue(newValue) {
        if (this.value !== undefined && this.value !== newValue) {
            this.scale = 1.5;
        }
        this.value = newValue;

        const ctx = this.context;
        ctx.save();
        ctx.font = Counter.numberFont();
        this.textMetrics = ctx.measureText(newValue);
        ctx.restore();

        const birdString = this.value === 1 ? "bird" : "birds";
        this.descriptionString = birdString + " " + this.actionString;

        this.width = newValue >= 10 ? 91 : 55;
    }

    static numberFont() {
        return "100 60px 'Proxima Nova'";
    }

    static counterPadding() {
        return 13;
    }

    update() {
        const opacitySpeed = 0.4;
        const targetOpacity = this.enabled ? 1.0 : 0.0;

        const oldOpacity = this.opacity;
        this.opacity = this.opacity * (1.0 - opacitySpeed) + targetOpacity * opacitySpeed;
        if (Math.abs(this.opacity - oldOpacity) > 0.001) {
            this.canvas.style.opacity = this.opacity;
        }

        const positionSpeed = 0.06;
        this.currentX = this.currentX * (1.0 - positionSpeed) + this.targetX * positionSpeed;
        this.currentY = this.currentY * (1.0 - positionSpeed) + this.targetY * positionSpeed;

        this.x = this.currentX;
        this.y = this.currentY;

        const oldScale = this.scale;
        this.scale = this.scale * 0.85 + 1.0 * 0.15;

        const epsilon = 0.001;
        if (Math.abs(this.scale - oldScale) > epsilon) {
            this.needsDisplay = true;
        }
    }

    draw() {
        const frameX = Math.floor(this.x - this.width - Counter.counterPadding()); + "px";
        const frameY = Math.floor(this.y - this.height / 2.0); + "px";
        setTransform(this.canvas, "translate3D(" + frameX + "px, " + frameY + "px, 0px)");

        if (this.needsDisplay) {
            const ctx = this.context;
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            const cornerRadius = 5;

            const originX = 20;
            const originY = 20;

            // Make a round rect...
            ctx.save();
            ctx.beginPath();

            const counterCenterX = originX + this.width / 2.0;
            const counterCenterY = originY + this.height / 2.0;

            ctx.translate(counterCenterX, counterCenterY);
            ctx.scale(this.scale, this.scale);
            ctx.translate(-counterCenterX, -counterCenterY);
            ctx.moveTo(originX + cornerRadius, originY);
            ctx.lineTo(originX + this.width - cornerRadius, originY);
            ctx.arcTo(originX + this.width, originY, originX + this.width, originY + cornerRadius, cornerRadius);
            ctx.lineTo(originX + this.width, originY + this.height - cornerRadius);
            ctx.arcTo(originX + this.width, originY + this.height, originX + this.width - cornerRadius, originY + this.height, cornerRadius);
            ctx.lineTo(originX + cornerRadius, originY + this.height);
            ctx.arcTo(originX, originY + this.height, originX, originY + this.height - cornerRadius, cornerRadius);
            ctx.lineTo(originX, originY + cornerRadius);
            ctx.arcTo(originX, originY, originX + cornerRadius, originY, cornerRadius);

            ctx.save();
            ctx.globalCompositeOperation = "multiply";
            ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
            ctx.shadowBlur = 30;
            ctx.fillStyle = "rgba(62, 62, 62, 0.25)";
            ctx.fill();
            ctx.restore();

            ctx.font = Counter.numberFont();
            ctx.fillStyle = "#ffc000";

            const ones = this.value % 10;
            const onesMeasure = ctx.measureText(ones);
            ctx.fillText(this.value % 10, originX + this.width - onesMeasure.width - 9, originY + this.height - Counter.counterPadding());
            if (this.value >= 10) {
                const tens = Math.floor(this.value / 10);
                ctx.fillStyle = "#ff9c00";
                const tensMeasure = ctx.measureText(tens)
                ctx.fillText(tens, originX + this.width - 44 - tensMeasure.width, originY + this.height - Counter.counterPadding());
            }
            ctx.restore();

            ctx.save();
            ctx.fillStyle = "white";
            ctx.font = "100 44px 'Proxima Nova'";
            ctx.fillText(this.descriptionString, originX + this.width + 10, originY + this.height - 14);

            this.needsDisplay = false;
        }
    }
}

class BirdsFlyingCounter extends Counter {
    constructor(y) {
        super(y, "flying");
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
    constructor(y) {
        super(y, "total");
        const line = document.createElement("div");
        line.style.backgroundColor = "white";
        line.style.height = "3px";
        line.style.width = `${330}px`;
        line.style.position = "absolute";
        line.style.top = `${y - 50}px`;
        line.style.left = `${this.currentX - 80}px`;
        this.canvas.parentNode.appendChild(line);
        this.line = line;
        this.lastY = this.y;
    }

    update() {
        super.update();
        if (this.y !== this.lastY) {
            this.lastY = this.y;
            this.line.style.top = `${this.y - 50}px`;
        }
        // this.y = window.scrollY + window.innerHeight - 100;
    }

    draw() {
        super.draw();
        /* TODO (reimplement)
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.x - this.width/2.0 - 80, this.y - this.height/2.0 - 30);
        ctx.lineTo(this.x + 220, this.y - this.height/2.0 - 30);
        ctx.lineWidth = 3;
        ctx.lineCapStyle = "round";
        ctx.strokeStyle = "white";
        ctx.stroke();
        ctx.restore();
*/
    }
}


function updateCounterValues() {
    birdsFlyingCounter.setValue(birds.filter((bird) => {
        return bird.flying && bird.active;
    }).length);
    onesFencePostCounter.setValue(onesPosts.filter((post) => {
        return post.bird !== null;
    }).length);
    combinedFencePostCounter.setValue(combinedPosts.filter((post) => {
        return post.bird !== null;
    }).length);
    totalCounter.setValue(birds.filter((bird) => {
        return bird.active;
    }).length);
}

const birdsFlyingCounter = new BirdsFlyingCounter(skySlotsY);
const onesFencePostCounter = new Counter(678, "sitting");
const combinedFencePostCounter = new Counter(2560, "sitting");
combinedFencePostCounter.enabled = false;
const totalCounter = new TotalCounter(810);

let numberOfBirdsSinging = 0;
const birdContainer = document.getElementById("bird-container");
const numberOfBirdFrames = 10;
class Bird {
    constructor(x, y) {
        this.element = document.createElement("div");
        this.element.style.position = "absolute";
        this.element.style.width = "143px";
        this.element.style.height = "140px";
        this.element.style.backgroundImage = "url(img/peep.png)";
        setTransform(this.element, "translate(-500px, -500px)");

        birdContainer.appendChild(this.element);

        this.x = x;
        this.y = y;
        this.targetX = this.x;
        this.targetY = this.y;
        this.floatOffsetX = 0;
        this.floatOffsetY = 0;
        this.flying = true;
        this.active = true;
        this.phase = Math.random() % (2 * Math.PI);
        this.frequencyX = 800 + Math.random() % 200;
        this.frequencyY = 600 + Math.random() % 150;
        this.floatOffsetAmplitudeX = 50;
        this.floatOffsetAmplitudeY = 30;
        this.flyingAngleAmplitude = Math.PI / 7.0;
        this.sittingAngleAmplitude = Math.PI / 25.0;
        this.animationIndex = Math.floor(Math.random() * numberOfBirdFrames);
        this.positionIndex = null;
        this.post = null;
        this.powerLine = null;
        this.canSing = true;
    }

    static width() {
        return 143;
    }

    static height() {
        return 140;
    }

    update() {
        const speed = 0.1;
        const floatOffsetX = this.flying ? Math.sin(Date.now() / this.frequencyX + this.phase) * this.floatOffsetAmplitudeX : 0.0;
        const floatOffsetY = this.flying ? Math.sin(Date.now() / this.frequencyY + this.phase) * this.floatOffsetAmplitudeY : 0.0;
        const targetX = this.targetX + floatOffsetX;
        const targetY = this.targetY + floatOffsetY;
        this.x = this.x * (1.0 - speed) + targetX * speed;
        this.y = this.y * (1.0 - speed) + targetY * speed;
        const originX = this.x - Bird.width() / 2.0;
        const originY = this.y - Bird.height() / 2.0;

        const bobbingAmplitude = this.flying ? this.flyingAngleAmplitude : this.sittingAngleAmplitude;
        this.angle = -Math.sin(Date.now() / this.frequencyX + this.phase) * bobbingAmplitude;

        const oldSinging = this.singing;
        this.singing = !this.flying && Math.abs(this.x - this.targetX) < 0.1 && Math.abs(this.y - this.targetY) < 0.1 && this.active;
        if (oldSinging != this.singing) {
            jukebox.update();
        }

        if (this.active) {
            let index;
            if (this.singing) {
                index = 0;
            } else {
                index = 1 + this.animationIndex;
            }
            this.element.style.backgroundPosition = index * Bird.width() + "px 0px";

            this.animationIndex = (this.animationIndex + 1) % numberOfBirdFrames;

            if (rectContainsMouse(this.x - Bird.width() / 4.0, this.y - Bird.height() / 4.0, Bird.width() / 2.0, Bird.height() / 2.0) && (Mouse.target === undefined || Mouse.target === this)) {
                if (Mouse.pressed) {
                    Mouse.target = this;
                }

                cursor = "pointer";

                if (!Mouse.pressed && this.pressed && Mouse.target === this) {
                    Mouse.target = undefined;

                    if (this.flying) {
                        for (var post of onesPosts.concat(combinedPosts)) {
                            if (post.bird === null) {
                                post.landBirdHere(this);
                                break;
                            }
                        }

                        if (this.flying) {
                            for (var powerLine of powerLines) {
                                if (powerLine.birds.length === 0) {
                                    powerLine.landBirdsHere([this]);
                                    break;
                                }
                            }
                        }
                    } else {
                        if (this.post != null) {
                            this.flyAway();
                        } else if (this.powerLine != null) {
                            for (let flyingBird of this.powerLine.birds) {
                                flyingBird.flyAway();
                            }
                            this.powerLine.birds = [];
                            this.powerLine = null;
                        }
                    }
                }
                this.pressed = Mouse.pressed;
            }
        }

        setTransform(this.element, "translateZ(0) translate(" + originX + "px, " + originY + "px) rotate(" + this.angle + "rad)");
    }

    landAt(x, y) {
        this.targetX = x;
        this.targetY = y;
        this.flying = false;
        skySpots[this.positionIndex] = false;
        this.positionIndex = null;
    }

    flyAway() {
        let skySpotIndex = (this.positionIndex !== null) ? this.positionIndex : skySpots.findIndex((el) => {
            return el === false;
        });

        const rightMargin = ((currentStage === "transition-to-combined") || (currentStage === "combined")) ? 200 : 500;
        this.targetX = 100 + (skySpotIndex * skySpacing) % (canvas.width - rightMargin);
        this.targetY = skySlotsY + skySpacing * Math.floor((skySpotIndex * skySpacing) / (canvas.width - rightMargin));
        this.flying = true;
        this.positionIndex = skySpotIndex;

        skySpots[skySpotIndex] = true;

        if (this.post !== null) {
            this.post.bird = null;
            this.post = null;
        }
    }
}

class Post {
    constructor(fenceElement, originX, originY) {
        const range = document.createRange();
        range.setStartAfter(fenceElement);
        const image = document.createElement("img");
        image.src = "img/fence-highlight.png";
        image.style.position = "absolute";
        image.style.left = originX + "px";
        image.style.top = originY + "px";
        image.style.opacity = 0;
        range.insertNode(image);

        this.image = image;

        this.originX = originX;
        this.originY = originY;
        this.bird = null;
    }

    static width() {
        return 70;
    }

    static height() {
        return 182;
    }

    update() {
        let highlight = rectContainsMouse(this.originX, this.originY, Post.width(), Post.height());
        if (!this.lastPressed && Mouse.pressed) {
            for (var bird of birds) {
                // Very very hacky z-ordering of hit testing.
                if (rectContainsMouse(bird.x - Bird.width() / 4.0, bird.y - Bird.height() / 4.0, Bird.width() / 2.0, Bird.height() / 2.0)) {
                    highlight = false;
                    break;
                }
            }
        }

        if (highlight) {
            cursor = "pointer";
        }

        if (Mouse.pressed && ((highlight && (Mouse.target === undefined)) || Mouse.target === this)) {
            this.pressed = highlight;
            Mouse.target = this.pressed ? this : undefined;
        } else if (this.pressed && !Mouse.pressed && Mouse.target === this) {
            if (this.bird !== null) {
                this.bird.flyAway();
            } else {
                // Find a flying bird; make it fly here.
                for (var bird of birds) {
                    if (bird.flying && bird.active) {
                        this.landBirdHere(bird);
                        break;
                    }
                }

                this.prompt = false;
            }

            this.pressed = false;
            Mouse.target = undefined;
        }
        this.lastPressed = Mouse.pressed;

        let highlightAlpha = 0.0;
        if (this.pressed) {
            highlightAlpha = 1.0;
        } else if (this.prompt) {
            highlightAlpha = (Math.sin(Date.now() / 190) + 1.0) / 2.0;
        }
        this.image.style.opacity = highlightAlpha * 0.5;
    }

    landBirdHere(bird) {
        this.bird = bird;
        bird.landAt(this.originX + Post.width() / 2.0, this.originY - 15);
        bird.post = this;
    }
}

class Wave {
    constructor(waveElement) {
        this.waveElement = waveElement;
        this.frequency = 1000 + (Math.random() % 1000);
        this.amplitudeX = 25;
        this.amplitudeY = 10;
    }

    update() {
        setTransform(this.waveElement, "translate(" + Math.sin(Date.now() / this.frequency) * this.amplitudeX + "px, " + Math.cos(Date.now() / this.frequency) * this.amplitudeY + "px)");
    }
}

class ScrollDownArrow {
    static centerX() {
        return canvas.width / 2.0;
    }

    constructor(y) {
        this.element = document.getElementById("scroll-down");
        this.height = this.element.height;

        this.anchorY = y;
        this.enabled = false;
        this.alpha = 0;
        this.targetAlpha = 0;

        this.targetScale = 1.0;
        this.scale = 1.0;
    }

    update() {
        this.x = ScrollDownArrow.centerX();
        this.y = this.anchorY + Math.sin(Date.now() / 1000) * 25;

        const targetAlpha = this.enabled ? 1.0 : 0.0;
        const alphaSpeed = 0.2;
        this.targetAlpha = this.targetAlpha * (1.0 - alphaSpeed) + targetAlpha * alphaSpeed;
        let newAlpha = this.targetAlpha * (1.0 - Math.min(1.0, Math.max(0.0, (window.scrollY - (this.anchorY - this.height)) / 100.0)));

        let newTransform;
        if (newAlpha > 0 || (this.alpha !== 0 && newAlpha === 0)) {
            this.alpha = newAlpha;
            newTransform = "translate(" + this.x + "px, " + this.y + "px)";
            this.element.style.opacity = this.alpha;
        }

        const highlight = rectContainsMouse(this.x, this.y, this.element.width, this.element.height);
        const highlightedScale = 1.15;
        this.targetScale = (highlight && !Mouse.pressed) ? highlightedScale : 1.0;
        const newScale = this.scale * 0.85 + this.targetScale * 0.15;
        newTransform += " scale(" + this.scale + ")";
        this.scale = (Math.abs(newScale - 1.0) < 0.01) ? 1.0 : newScale;

        if (highlight && this.enabled) {
            cursor = "pointer";
            if (this.pressed && !Mouse.pressed) {
                window.scrollTo(0, this.y + 250);
            }
            this.pressed = Mouse.pressed;
        }

        if (this.oldTransform !== newTransform) {
            setTransform(this.element, newTransform);
            this.oldTransform = newTransform;
        }
    }
}

class PowerLine {
    static highlightImage() {
        if (this._highlightImage === undefined) {
            this._highlightImage = loadImage("power-line-brightener");
        }
        return this._highlightImage;
    }

    static missingBirdImage() {
        if (this._missingBirdImage === undefined) {
            this._missingBirdImage = loadImage("bird-outline-prompt");
        }
        return this._missingBirdImage;
    }

    constructor(centerX, centerY, radius, firstDotX, firstDotY, secondDotX, secondDotY, beamX, beamY, otherPowerLinesToCount) {
        this.missingBirdElements = [];
        for (var missingBirdIndex = 0; missingBirdIndex < 10; missingBirdIndex++) {
            const missingBirdImage = document.createElement("img");
            missingBirdImage.src = PowerLine.missingBirdImage().src;
            missingBirdImage.style.position = "absolute";
            missingBirdImage.style.display = "hidden";
            missingBirdImage.hidden = true;
            birdContainer.appendChild(missingBirdImage);
            this.missingBirdElements.push(missingBirdImage);
        }

        this.highlightImage = document.createElement("img");
        this.highlightImage.src = PowerLine.highlightImage().src;
        this.highlightImage.style.position = "absolute";
        this.highlightImage.style.left = beamX + "px";
        this.highlightImage.style.top = beamY + "px";
        this.highlightImage.style.opacity = 0;
        this.highlightImage.oldAlpha = 0;
        rootContainer.appendChild(this.highlightImage);

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

        this.birds = [];

        this.debugDrawing = false;

        if (otherPowerLinesToCount !== undefined) {
            this.counter = new Counter(beamY + 110, "sitting");
            this.otherPowerLinesToCount = otherPowerLinesToCount;
        } else {
            this.counter = null;
        }
        this.setEnabled(true);
    }

    update() {
        if (this.counter !== null) {
            let total = this.birds.length;
            for (let otherPowerLine of this.otherPowerLinesToCount) {
                total += otherPowerLine.birds.length;
            }
            this.counter.setValue(total);
            this.counter.update();
        }
        if (!this.enabled) {
            return;
        }

        const highlight = rectContainsMouse(this.beamX, this.beamY, PowerLine.highlightImage().width, PowerLine.highlightImage().height);
        if (highlight) {
            cursor = "pointer";
        }
        if (Mouse.pressed) {
            this.pressed = highlight;
        } else if (this.pressed && !Mouse.pressed) {
            if (this.birds.length === 0) {
                this.landBirdsHere(birds);
                this.prompt = false;
            } else {
                for (const flyingBird of this.birds) {
                    flyingBird.flyAway();
                }
                this.birds = [];
            }

            this.pressed = false;
        }

        for (var birdIndex = 0; birdIndex < 10; birdIndex++) {
            const missingBirdElement = this.missingBirdElements[birdIndex];

            if (birdIndex >= this.birds.length && this.birds.length > 0 && this.birds.length < 10) {
                missingBirdElement.style.opacity = (Math.sin((Date.now() - this.landingTime) / 150) + 1.0) / 2.0;
                setTransform(missingBirdElement, "translate3D(" + (this.dotPoints[birdIndex][0] - missingBirdElement.width / 2.0) + "px, " + (this.dotPoints[birdIndex][1] - 18 - missingBirdElement.height / 2.0) + "px, 0px)");
                if (missingBirdElement.hidden === true) {
                    missingBirdElement.style.display = "initial";
                    missingBirdElement.hidden = false;
                }
            } else {
                if (missingBirdElement.hidden === false) {
                    missingBirdElement.style.display = "none";
                    missingBirdElement.hidden = true;
                }
            }
        }

        const oldHighlightAlpha = this.highlightImage.oldAlpha;
        let highlightAlpha = 0.0;
        if (this.pressed) {
            highlightAlpha = 1.0;
        } else if (this.prompt) {
            highlightAlpha = (Math.sin(Date.now() / 190) + 1.0) / 2.0;
        }

        if (Math.abs(highlightAlpha - oldHighlightAlpha)) {
            this.highlightImage.style.opacity = highlightAlpha * 0.5;
            this.highlightImage.oldAlpha = highlightAlpha;
        }
    }

    landBirdsHere(landingBirds) {
        for (var birdIndex = 0; birdIndex < landingBirds.length && this.birds.length < 10; birdIndex++) {
            const bird = landingBirds[birdIndex];
            if (bird.flying && bird.active) {
                const dotPoint = this.dotPoints[this.birds.length];
                bird.landAt(dotPoint[0], dotPoint[1] - 15);
                bird.powerLine = this;
                this.birds.push(bird);
            }
        }
        this.landingTime = Date.now();

        if (this.birds.length < 10) {
            suppressNextBirdSequence = true;
            setTimeout(() => {
                suppressNextBirdSequence = false;
                for (var bird of this.birds) {
                    bird.flyAway();
                }
                this.birds = [];
            }, 1600);
        }
    }

    draw() {
        if (this.counter !== null) {
            this.counter.draw();
        }
    }

    setEnabled(newValue) {
        this.enabled = newValue;
        if (this.counter !== null) {
            this.counter.enabled = newValue;
        }
    }
}

class PlayAgain {
    constructor() {
        this.element = document.getElementById("play-again");
        this.youDidIt = document.getElementById("you-did-it");
        this.active = false;
        this.y = 3600;

        const makeBird = function(parentNode) {
            const bird = new Bird(0, 0);
            parentNode.appendChild(bird.element);
            bird.flying = true;
            bird.flyingAngleAmplitude /= 6.0;
            bird.floatOffsetAmplitudeX /= 1.6;
            bird.floatOffsetAmplitudeY /= 1.6;
            return bird;
        };
        this.carryingBird1 = makeBird(this.element);
        this.carryingBird2 = makeBird(this.element);
        this.unhelpfulBird1 = makeBird(this.element);
        this.unhelpfulBird2 = makeBird(this.element);

        this.sittingBirds = [];
        for (var sittingBirdIndex = 0; sittingBirdIndex < 3; sittingBirdIndex++) {
            const sittingBird = makeBird(this.element);
            sittingBird.flying = false;
            sittingBird.canSing = false;
            this.sittingBirds.push(sittingBird);
        }

        document.getElementById("play-again-link").onclick = (event) => {
            this.playAgain();
            event.preventDefault();
            event.stopPropagation();
        };

        this.hue = 0;

        this.blackout = document.getElementById("blackout");
        this.lastBlackoutAlpha = 0;
    }

    set active(newValue) {
        if (newValue) {
            this.element.style.display = "block";
            this.blackout.style.display = "block";
        }
        Mouse.enabled = !newValue;

        this._active = newValue;
    }

    get active() {
        return this._active;
    }

    playAgain() {
        this.active = false;

        for (const flyingBird of birds) {
            if (flyingBird.active) {
                flyingBird.flyAway();
                flyingBird.targetY = 3600;
                flyingBird.active = false;
            }
        }

        for (const powerLine of powerLines) {
            powerLine.birds = [];
        }

        setTimeout(() => {
            for (const flyingBird of birds) {
                flyingBird.element.parentNode.removeChild(flyingBird.element);
            }
            birds = [];
            skySpots.fill(false);
            setCurrentStage("combined");
        }, 2000);


    }

    update() {
        const targetY = this.active ? 2300 : 3600;
        const newY = this.y * 0.9 + targetY * 0.1;
        if (Math.abs(this.y - newY) > 0.1) {
            this.element.style.top = `${newY}px`;
        }

        if (this.y < 3400 && newY > 3400 && !this.active) {
            this.element.style.display = "none";
            this.blackout.style.display = "none";
        }

        const blackoutTargetAlpha = this.active ? 1 : 0;
        const newBlackoutAlpha = this.lastBlackoutAlpha * 0.9 + blackoutTargetAlpha * 0.1;
        if (Math.abs(this.lastBlackoutAlpha - newBlackoutAlpha) > 0.01) {
            this.blackout.style.opacity = newBlackoutAlpha;
            this.lastBlackoutAlpha = newBlackoutAlpha;
        }

        this.y = newY;

        if (this.active) {
            this.carryingBird1.update();
            this.carryingBird2.update();

            setTransform(this.element, `translate(${this.carryingBird1.x}px, ${this.carryingBird1.y}px) rotate(${this.carryingBird1.angle}rad)`);

            const y = -397;
            setTransform(this.carryingBird1.element, `translate(-65px, ${y}px)`);
            setTransform(this.carryingBird2.element, `translate(318px, ${y}px)`);

            for (const sittingBird of this.sittingBirds) {
                sittingBird.update();
            }
            setTransform(this.sittingBirds[0].element, `translate(20px, ${y}px) rotate(${this.sittingBirds[0].angle}rad)`);
            setTransform(this.sittingBirds[1].element, `translate(130px, ${y}px) rotate(${this.sittingBirds[1].angle}rad)`);
            setTransform(this.sittingBirds[2].element, `translate(210px, ${y}px) rotate(${this.sittingBirds[2].angle}rad)`);

            this.unhelpfulBird1.update();
            this.unhelpfulBird2.update();
            setTransform(this.unhelpfulBird1.element, `translate(${-105 + this.unhelpfulBird1.x}px, ${-265 + this.unhelpfulBird1.y}px) rotate(${-this.carryingBird1.angle + this.unhelpfulBird1.angle}rad)`);
            setTransform(this.unhelpfulBird2.element, `translate(${350 + this.unhelpfulBird2.x}px, ${-160 + this.unhelpfulBird2.y}px) rotate(${-this.carryingBird1.angle + this.unhelpfulBird2.angle}rad)`);

            this.hue = (this.hue + 2) % 360;
            this.youDidIt.style.color = `hsl(${this.hue}, 90%, 60%)`;
        }
    }
}

let birds = [];

let onesPosts = [];
const firstFence = document.getElementById("first-fence");
for (let postIndex = 0; postIndex < 9; postIndex++) {
    onesPosts.push(new Post(firstFence, firstFencePostOriginX + postIndex * (Post.width() + fencePostSpacing), onesFencePostY));
}
onesPosts[0].prompt = true;
const combinedPosts = [];

const waves = [];
const waveElements = document.querySelectorAll(".wave");
for (let waveIndex = 0; waveIndex < waveElements.length; waveIndex++) {
    waves.push(new Wave(waveElements.item(waveIndex)));
}

const powerLine1 = new PowerLine(755, -484, 1788.5, 298.5, 1248, 374.5, 1266, 27, 1208);
const powerLine2 = new PowerLine(755, -410, 1788.5, 298.5, 1320, 374.5, 1338, 27, 1279);
const powerLine3 = new PowerLine(755, -338, 1788.5, 298.5, 1392, 374.5, 1410, 27, 1349, [powerLine1, powerLine2]);
const powerLine4 = new PowerLine(726, 157, 1998.5, 221, 2082, 297, 2104, -43, 2056);
const powerLine5 = new PowerLine(726, 220, 1998.5, 221, 2155, 297, 2177, -43, 2126);
const powerLine6 = new PowerLine(726, 297.5, 1998.5, 221, 2229, 297, 2259, -43, 2196, [powerLine4, powerLine5]);

const powerLines = [
    powerLine1,
    powerLine2,
    powerLine3,
    powerLine4,
    powerLine5,
    powerLine6
];
for (var i = 0; i < 6; i++) {
    powerLines[i].setEnabled(false);
}
const scrollDownArrow = new ScrollDownArrow(680);

const playAgain = new PlayAgain();

let currentStage;
setCurrentStage("ones");
// setCurrentStage("transition-to-tens");
// setCurrentStage("tens");
// setCurrentStage("transition-to-combined");
// setCurrentStage("combined");
// setCurrentStage("complete");
let numberOfBirdsWhenStartingCombinedStage;

function goToNextStage() {
    const transitions = {
        "ones": "transition-to-tens",
        "transition-to-tens": "tens",
        "tens": "transition-to-combined",
        "transition-to-combined": "combined",
        "combined": "complete",
    };
    setCurrentStage(transitions[currentStage]);
}

function setCurrentStage(newStage) {
    switch (newStage) {
        case "transition-to-tens":
            for (var birdIndex = birds.length; birdIndex < 10; birdIndex++) {
                addBird();
            }
            setTimeout(() => {
                scrollDownArrow.enabled = true;
            }, 2500);
            break;
        case "tens":
            skySlotsY = tensSkySlotsY;
            for (var bird of birds) {
                bird.flyAway();
            }

            onesPosts = [];
            birdsFlyingCounter.targetY = tensSkySlotsY + 20;
            totalCounter.targetY = 1790;
            onesFencePostCounter.enabled = false;

            powerLines[0].prompt = true;
            for (var i = 0; i < 3; i++) {
                powerLines[i].setEnabled(true);
            }
            break;
        case "transition-to-combined":
            scrollDownArrow.anchorY = 1650;
            break;
        case "combined":
            for (var i = 0; i < 6; i++) {
                powerLines[i].setEnabled(i >= 3);
            }

            const secondFence = document.getElementById("second-fence");
            for (let postIndex = 0; postIndex < 9; postIndex++) {
                combinedPosts.push(new Post(secondFence, firstFencePostOriginX + postIndex * (Post.width() + fencePostSpacing), combinedFencePostY));
            }
            combinedFencePostCounter.enabled = true;

            skySlotsY = combinedSkySlotsY;
            birdsFlyingCounter.targetY = skySlotsY + 20;

            for (var birdIndex = 0; birdIndex < 30 && birdIndex < birds.length; birdIndex++) {
                const bird = birds[birdIndex];
                bird.targetX = (Math.random() > 0.5) ? -canvas.width / 6.0 : canvas.width * 1.15;
                skySpots[bird.positionIndex] = false;
                bird.active = false;
            }
            for (var birdIndex = birds.length; birdIndex < 5; birdIndex++) {
                addBird();
            }

            for (const flyingBird of birds) {
                if (flyingBird.active) {
                    flyingBird.flyAway();
                }
            }

            totalCounter.targetY = 2700;
            numberOfBirdsWhenStartingCombinedStage = birds.length;

            break;
        case "complete":
            setTimeout(() => {
                playAgain.active = true;
            }, 2000);
            break;
    }
    currentStage = newStage;
}


function addBird() {
    const bird = new Bird(-Bird.width(), skySlotsY);
    bird.flyAway();
    birds.push(bird);
}


let dateWhenSkyEmptied = null;

function drawScene() {
    mamaCloud.currentX -= 0.3;
    if (mamaCloud.currentX < -(mamaCloud.width + 100)) {
        mamaCloud.currentX = canvas.width;
    }
    mamaCloud.style.left = mamaCloud.currentX + "px";

    weeCloud.currentX -= 0.5;
    if (weeCloud.currentX < -(weeCloud.width + 100)) {
        weeCloud.currentX = canvas.width;
    }
    weeCloud.style.left = weeCloud.currentX + "px";

    for (var post of onesPosts) {
        post.update();
    }

    for (var wave of waves) {
        wave.update();
    }

    for (var post of combinedPosts) {
        post.update();
    }

    for (var bird of birds) {
        bird.update();
    }

    const numberOfBirdsInSky = skySpots.filter((el) => {
        return el === true;
    }).length;
    if (numberOfBirdsInSky === 0 && !suppressNextBirdSequence) {
        if (birds.length === 0 || (dateWhenSkyEmptied !== null && (Date.now() - dateWhenSkyEmptied) > 750)) {
            if (currentStage === "ones") {
                addBird();
                if (birds.length >= 10) {
                    goToNextStage();
                }
            } else if (currentStage === "tens") {
                if (birds.length < 30) {
                    for (var i = 0; i < 10; i++) {
                        addBird();
                    }
                } else {
                    for (var i = 0; i < 5; i++) {
                        addBird();
                    }
                }
                if (birds.length > 30) {
                    goToNextStage();
                }
            } else if (currentStage === "combined") {
                const sequence = [8, 3, 7, 5, 9, 2];
                let accumulator = numberOfBirdsWhenStartingCombinedStage;
                for (const quantity of sequence) {
                    if (birds.length >= accumulator && birds.length < accumulator + quantity) {
                        for (var i = 0; i < quantity; i++) {
                            addBird();
                        }
                        break;
                    }
                    accumulator += quantity;
                }
                if (accumulator === numberOfBirdsWhenStartingCombinedStage + sequence.reduce((acc, el) => {
                    return acc + el;
                })) {
                    goToNextStage();
                }
            }
            dateWhenSkyEmptied = null;
        } else if (dateWhenSkyEmptied === null) {
            dateWhenSkyEmptied = Date.now();
        }
    }

    scrollDownArrow.update();

    updateCounterValues();
    birdsFlyingCounter.update();
    birdsFlyingCounter.draw();
    onesFencePostCounter.update();
    onesFencePostCounter.draw();
    combinedFencePostCounter.update();
    combinedFencePostCounter.draw();

    totalCounter.update();
    totalCounter.draw();

    for (var powerLine of powerLines) {
        powerLine.update();
        powerLine.draw();
    }

    if (currentStage === "transition-to-tens") {
        if (onesFencePostCounter.y - birdsFlyingCounter.y < 120) {
            goToNextStage();
        }
    } else if (currentStage === "transition-to-combined") {
        if (window.scrollY > 1460) {
            goToNextStage();
        }
    }

    playAgain.update();

    applyCursor();
    cursor = "initial";
}

let cursor = "initial";
let lastCursor = cursor;

function applyCursor() {
    if (cursor !== lastCursor) {
        rootContainer.style.cursor = cursor;
        lastCursor = cursor;
    }
}

function rectContainsMouse(x, y, width, height) {
    return (Mouse.x >= x) &&
        (Mouse.y >= y) &&
        (Mouse.x < (x + width)) &&
        (Mouse.y < (y + height));
}

function setTransform(element, transformString) {
    element.style.transform = transformString;
    element.style.webkitTransform = transformString;
}

const sizeWarning = document.getElementById("size-warning");
const sizeWarningText = document.getElementById("size-warning-text");
window.onresize = () => {
    const minWidth = 1000;
    const minHeight = 680;


    if (window.screen.availWidth < minWidth || window.screen.availHeight < minHeight) {
        sizeWarningText.innerHTML = "We're sorry, but this screen is too small for this activity. Please give it a try on a device with a larger screen.";
        sizeWarning.style.display = "block";
    } else {
        sizeWarning.style.display = (window.innerWidth < 1000 || window.innerHeight <= 680) ? "block" : "none";        
        const scalingFactor = Math.min(1.0, Math.max(1000, window.innerWidth) / 1366);
        Mouse.scalingFactor = scalingFactor;
        rootContainer.style.transform = `scale(${scalingFactor})`;
    }
};
window.onresize();


window.requestAnimFrame = window.requestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000 / 60);
    };
(function animloop() {
    requestAnimFrame(animloop);
    drawScene();
})();