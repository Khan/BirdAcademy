/**

This is code for a hackathon.

It is full of hacks.

Forgive me.

<3 Andy

**/

"use strict";

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Jukebox = (function () {
    _createClass(Jukebox, null, [{
        key: "postClipLength",
        value: function postClipLength() {
            return 3.583;
        }
    }, {
        key: "postTimings",
        value: function postTimings() {
            return [0, 0.667, 0.883, 1.290, 1.718, 2.004, 2.140, 2.403, 2.601];
        }
    }]);

    function Jukebox() {
        var _this = this;

        _classCallCheck(this, Jukebox);

        var soundsPath = "sound/";
        var soundsExtension = ".mp3";
        var samples = {};

        this.powerLineSampleNames = [];
        for (var powerLineIndex = 0; powerLineIndex < 3; powerLineIndex++) {
            var sampleName = "lines" + (powerLineIndex + 1);
            this.powerLineSampleNames.push(sampleName);
            samples[sampleName] = "" + soundsPath + sampleName + soundsExtension;
        }

        this.postSampleNames = [];
        for (var postIndex = 0; postIndex < 9; postIndex++) {
            var sampleName = "posts" + (postIndex + 1);
            this.postSampleNames.push(sampleName);
            samples[sampleName] = "" + soundsPath + sampleName + soundsExtension;
        }

        blip.sampleLoader().samples(samples).done(function () {
            _this.done = true;
            _this.loop = blip.loop();
            _this.loop.tickInterval(Jukebox.postClipLength()).each(function (time, iteration) {
                _this.postSounds = _this.postSampleNames.map(function (sampleName) {
                    return blip.clip().sample(sampleName);
                });
                _this.powerLineSounds = _this.powerLineSampleNames.map(function (sampleName) {
                    return blip.clip().sample(sampleName);
                });

                _this.loopTime = time;
                _this.update(true);

                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = _this.postSounds.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var postEntry = _step.value;

                        postEntry[1].play(time + Jukebox.postTimings()[postEntry[0]]);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator["return"]) {
                            _iterator["return"]();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }

                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = _this.powerLineSounds.entries()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var powerLineEntry = _step2.value;

                        powerLineEntry[1].play(time + (powerLineEntry[0] > 0 ? Jukebox.postClipLength() : 0));
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                            _iterator2["return"]();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }
            });
            _this.looping = false;
        }).load();
    }

    _createClass(Jukebox, [{
        key: "update",
        value: function update(fromLoop) {
            var shouldLoop = false;
            var posts = onesPosts.length > 0 ? onesPosts : combinedPosts;
            for (var i = 0; i < posts.length; i++) {
                var hasSingingBird = posts[i].bird !== null && posts[i].bird.singing;
                shouldLoop = shouldLoop || hasSingingBird;
            }

            var basePowerLineIndex = null;
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

            var numberOfPhrases = 1;
            for (var powerLineIndex = 0; powerLineIndex < 3; powerLineIndex++) {
                if (basePowerLineIndex !== null) {
                    var powerLine = powerLines[basePowerLineIndex + powerLineIndex];
                    var shouldSing = powerLine.birds.length === 10 && powerLine.birds[0].singing;
                    if (shouldSing) {
                        numberOfPhrases = 2;
                    }
                    shouldLoop = shouldLoop || shouldSing;
                }
            }
            this.loop.tickInterval(Jukebox.postClipLength() * numberOfPhrases);

            var oldLooping = this.looping;
            this.looping = shouldLoop;
            if (oldLooping && !shouldLoop) {
                this.loop.stop();
                return;
            } else if (!oldLooping && shouldLoop && fromLoop !== true) {
                this.loop.start();
                return;
            }

            var maxGain = 0.5;

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this.postSounds.entries()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var postEntry = _step3.value;

                    var postIndex = postEntry[0];
                    if (posts.length > 0) {
                        var hasSingingBird = posts[postIndex].bird !== null && posts[postIndex].bird.singing;
                        postEntry[1].gain(hasSingingBird ? maxGain : 0);
                    } else {
                        postEntry[1].gain(0);
                    }
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
                        _iterator3["return"]();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }

            for (var powerLineIndex = 0; powerLineIndex < 3; powerLineIndex++) {
                var shouldSing = 0;
                if (basePowerLineIndex !== null) {
                    var powerLine = powerLines[basePowerLineIndex + powerLineIndex];
                    shouldSing = powerLine.birds.length === 10 && powerLine.birds[0].singing;
                }
                this.powerLineSounds[powerLineIndex].gain(shouldSing ? maxGain : 0);
            }
        }
    }]);

    return Jukebox;
})();

var jukebox = new Jukebox();

var canvas = {
    width: 1366,
    height: 3400
};
var rootContainer = document.getElementById("bird-academy-container");

function loadImage(name) {
    var image = new Image();
    image.src = "img/" + name + ".png";
    return image;
}

var mamaCloud = document.getElementById("mama-cloud");
mamaCloud.currentX = 100;

var weeCloud = document.getElementById("wee-cloud");
weeCloud.currentX = 400;

var firstFencePostOriginX = 6;
var fencePostSpacing = 6;
var onesFencePostY = 725;
var combinedFencePostY = 2570;

var skySpacing = 120;
var onesSkySlotsY = 290;
var tensSkySlotsY = 1566;
var combinedSkySlotsY = 2415;
var skySlotsY = onesSkySlotsY;

var skySpots = [];
for (var skySpotsIndex = 0; skySpotsIndex < 50; skySpotsIndex++) {
    skySpots.push(false);
}

var suppressNextBirdSequence = false;

var Counter = (function () {
    function Counter(y, actionString) {
        _classCallCheck(this, Counter);

        this.canvas = document.createElement("canvas");
        this.canvas.width = 350;
        this.canvas.height = 100;
        this.canvas.style.position = "absolute";
        setTransform(this.canvas, "translateZ(0)");
        rootContainer.appendChild(this.canvas);
        this.context = this.canvas.getContext("2d");

        var counterX = 1080;
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

    _createClass(Counter, [{
        key: "setValue",
        value: function setValue(newValue) {
            if (this.value !== undefined && this.value !== newValue) {
                this.scale = 1.5;
            }
            this.value = newValue;

            var ctx = this.context;
            ctx.save();
            ctx.font = Counter.numberFont();
            this.textMetrics = ctx.measureText(newValue);
            ctx.restore();

            var birdString = this.value === 1 ? "bird" : "birds";
            this.descriptionString = birdString + " " + this.actionString;

            this.width = newValue >= 10 ? 91 : 55;
        }
    }, {
        key: "update",
        value: function update() {
            var opacitySpeed = 0.4;
            var targetOpacity = this.enabled ? 1.0 : 0.0;

            var oldOpacity = this.opacity;
            this.opacity = this.opacity * (1.0 - opacitySpeed) + targetOpacity * opacitySpeed;
            if (Math.abs(this.opacity - oldOpacity) > 0.001) {
                this.canvas.style.opacity = this.opacity;
            }

            var positionSpeed = 0.06;
            this.currentX = this.currentX * (1.0 - positionSpeed) + this.targetX * positionSpeed;
            this.currentY = this.currentY * (1.0 - positionSpeed) + this.targetY * positionSpeed;

            this.x = this.currentX;
            this.y = this.currentY;

            var oldScale = this.scale;
            this.scale = this.scale * 0.85 + 1.0 * 0.15;

            var epsilon = 0.001;
            if (Math.abs(this.scale - oldScale) > epsilon) {
                this.needsDisplay = true;
            }
        }
    }, {
        key: "draw",
        value: function draw() {
            var frameX = Math.floor(this.x - this.width - Counter.counterPadding());+"px";
            var frameY = Math.floor(this.y - this.height / 2.0);+"px";
            setTransform(this.canvas, "translate3D(" + frameX + "px, " + frameY + "px, 0px)");

            if (this.needsDisplay) {
                var ctx = this.context;
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                var cornerRadius = 5;

                var originX = 20;
                var originY = 20;

                // Make a round rect...
                ctx.save();
                ctx.beginPath();

                var counterCenterX = originX + this.width / 2.0;
                var counterCenterY = originY + this.height / 2.0;

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

                var ones = this.value % 10;
                var onesMeasure = ctx.measureText(ones);
                ctx.fillText(this.value % 10, originX + this.width - onesMeasure.width - 9, originY + this.height - Counter.counterPadding());
                if (this.value >= 10) {
                    var tens = Math.floor(this.value / 10);
                    ctx.fillStyle = "#ff9c00";
                    var tensMeasure = ctx.measureText(tens);
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
    }], [{
        key: "numberFont",
        value: function numberFont() {
            return "100 60px 'Proxima Nova'";
        }
    }, {
        key: "counterPadding",
        value: function counterPadding() {
            return 13;
        }
    }]);

    return Counter;
})();

var BirdsFlyingCounter = (function (_Counter) {
    _inherits(BirdsFlyingCounter, _Counter);

    function BirdsFlyingCounter(y) {
        _classCallCheck(this, BirdsFlyingCounter);

        _get(Object.getPrototypeOf(BirdsFlyingCounter.prototype), "constructor", this).call(this, y, "flying");
        this.floatOffsetX = 0;
        this.floatOffsetY = 0;
    }

    _createClass(BirdsFlyingCounter, [{
        key: "update",
        value: function update() {
            _get(Object.getPrototypeOf(BirdsFlyingCounter.prototype), "update", this).call(this);

            this.floatOffsetX += Math.sin(Date.now() / 3000) * 0.1;
            this.floatOffsetY += Math.sin(Date.now() / 1800) * 0.3;

            var scrollingOffset = currentStage === "ones" ? 0 : Math.max(0, window.scrollY - this.targetY + 150);

            this.x = this.currentX + this.floatOffsetX;
            this.y = this.currentY + scrollingOffset + this.floatOffsetY;
        }
    }, {
        key: "draw",
        value: function draw() {
            _get(Object.getPrototypeOf(BirdsFlyingCounter.prototype), "draw", this).call(this);
        }
    }]);

    return BirdsFlyingCounter;
})(Counter);

var TotalCounter = (function (_Counter2) {
    _inherits(TotalCounter, _Counter2);

    function TotalCounter(y) {
        _classCallCheck(this, TotalCounter);

        _get(Object.getPrototypeOf(TotalCounter.prototype), "constructor", this).call(this, y, "total");
        var line = document.createElement("div");
        line.style.backgroundColor = "white";
        line.style.height = "3px";
        line.style.width = 330 + "px";
        line.style.position = "absolute";
        line.style.top = y - 50 + "px";
        line.style.left = this.currentX - 80 + "px";
        this.canvas.parentNode.appendChild(line);
        this.line = line;
        this.lastY = this.y;
    }

    _createClass(TotalCounter, [{
        key: "update",
        value: function update() {
            _get(Object.getPrototypeOf(TotalCounter.prototype), "update", this).call(this);
            if (this.y !== this.lastY) {
                this.lastY = this.y;
                this.line.style.top = this.y - 50 + "px";
            }
            // this.y = window.scrollY + window.innerHeight - 100;
        }
    }, {
        key: "draw",
        value: function draw() {
            _get(Object.getPrototypeOf(TotalCounter.prototype), "draw", this).call(this);
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
    }]);

    return TotalCounter;
})(Counter);

function updateCounterValues() {
    birdsFlyingCounter.setValue(birds.filter(function (bird) {
        return bird.flying && bird.active;
    }).length);
    onesFencePostCounter.setValue(onesPosts.filter(function (post) {
        return post.bird !== null;
    }).length);
    combinedFencePostCounter.setValue(combinedPosts.filter(function (post) {
        return post.bird !== null;
    }).length);
    totalCounter.setValue(birds.filter(function (bird) {
        return bird.active;
    }).length);
}

var birdsFlyingCounter = new BirdsFlyingCounter(skySlotsY);
var onesFencePostCounter = new Counter(678, "sitting");
var combinedFencePostCounter = new Counter(2560, "sitting");
combinedFencePostCounter.enabled = false;
var totalCounter = new TotalCounter(810);

var numberOfBirdsSinging = 0;
var birdContainer = document.getElementById("bird-container");
var numberOfBirdFrames = 10;

var Bird = (function () {
    function Bird(x, y) {
        _classCallCheck(this, Bird);

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

    _createClass(Bird, [{
        key: "update",
        value: function update() {
            var speed = 0.1;
            var floatOffsetX = this.flying ? Math.sin(Date.now() / this.frequencyX + this.phase) * this.floatOffsetAmplitudeX : 0.0;
            var floatOffsetY = this.flying ? Math.sin(Date.now() / this.frequencyY + this.phase) * this.floatOffsetAmplitudeY : 0.0;
            var targetX = this.targetX + floatOffsetX;
            var targetY = this.targetY + floatOffsetY;
            this.x = this.x * (1.0 - speed) + targetX * speed;
            this.y = this.y * (1.0 - speed) + targetY * speed;
            var originX = this.x - Bird.width() / 2.0;
            var originY = this.y - Bird.height() / 2.0;

            var bobbingAmplitude = this.flying ? this.flyingAngleAmplitude : this.sittingAngleAmplitude;
            this.angle = -Math.sin(Date.now() / this.frequencyX + this.phase) * bobbingAmplitude;

            var oldSinging = this.singing;
            this.singing = !this.flying && Math.abs(this.x - this.targetX) < 0.1 && Math.abs(this.y - this.targetY) < 0.1 && this.active;
            if (oldSinging != this.singing) {
                jukebox.update();
            }

            if (this.active) {
                var index = undefined;
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
                            var _iteratorNormalCompletion4 = true;
                            var _didIteratorError4 = false;
                            var _iteratorError4 = undefined;

                            try {
                                for (var _iterator4 = onesPosts.concat(combinedPosts)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                    var post = _step4.value;

                                    if (post.bird === null) {
                                        post.landBirdHere(this);
                                        break;
                                    }
                                }
                            } catch (err) {
                                _didIteratorError4 = true;
                                _iteratorError4 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
                                        _iterator4["return"]();
                                    }
                                } finally {
                                    if (_didIteratorError4) {
                                        throw _iteratorError4;
                                    }
                                }
                            }

                            if (this.flying) {
                                var _iteratorNormalCompletion5 = true;
                                var _didIteratorError5 = false;
                                var _iteratorError5 = undefined;

                                try {
                                    for (var _iterator5 = powerLines[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                                        var powerLine = _step5.value;

                                        if (powerLine.birds.length === 0) {
                                            powerLine.landBirdsHere([this]);
                                            break;
                                        }
                                    }
                                } catch (err) {
                                    _didIteratorError5 = true;
                                    _iteratorError5 = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion5 && _iterator5["return"]) {
                                            _iterator5["return"]();
                                        }
                                    } finally {
                                        if (_didIteratorError5) {
                                            throw _iteratorError5;
                                        }
                                    }
                                }
                            }
                        } else {
                            if (this.post != null) {
                                this.flyAway();
                            } else if (this.powerLine != null) {
                                var _iteratorNormalCompletion6 = true;
                                var _didIteratorError6 = false;
                                var _iteratorError6 = undefined;

                                try {
                                    for (var _iterator6 = this.powerLine.birds[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                                        var flyingBird = _step6.value;

                                        flyingBird.flyAway();
                                    }
                                } catch (err) {
                                    _didIteratorError6 = true;
                                    _iteratorError6 = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion6 && _iterator6["return"]) {
                                            _iterator6["return"]();
                                        }
                                    } finally {
                                        if (_didIteratorError6) {
                                            throw _iteratorError6;
                                        }
                                    }
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
    }, {
        key: "landAt",
        value: function landAt(x, y) {
            this.targetX = x;
            this.targetY = y;
            this.flying = false;
            skySpots[this.positionIndex] = false;
            this.positionIndex = null;
        }
    }, {
        key: "flyAway",
        value: function flyAway() {
            var skySpotIndex = this.positionIndex !== null ? this.positionIndex : skySpots.findIndex(function (el) {
                return el === false;
            });

            var rightMargin = currentStage === "transition-to-combined" || currentStage === "combined" ? 200 : 500;
            this.targetX = 100 + skySpotIndex * skySpacing % (canvas.width - rightMargin);
            this.targetY = skySlotsY + skySpacing * Math.floor(skySpotIndex * skySpacing / (canvas.width - rightMargin));
            this.flying = true;
            this.positionIndex = skySpotIndex;

            skySpots[skySpotIndex] = true;

            if (this.post !== null) {
                this.post.bird = null;
                this.post = null;
            }
        }
    }], [{
        key: "width",
        value: function width() {
            return 143;
        }
    }, {
        key: "height",
        value: function height() {
            return 140;
        }
    }]);

    return Bird;
})();

var Post = (function () {
    function Post(fenceElement, originX, originY) {
        _classCallCheck(this, Post);

        var range = document.createRange();
        range.setStartAfter(fenceElement);
        var image = document.createElement("img");
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

    _createClass(Post, [{
        key: "update",
        value: function update() {
            var highlight = rectContainsMouse(this.originX, this.originY, Post.width(), Post.height());
            if (!this.lastPressed && Mouse.pressed) {
                var _iteratorNormalCompletion7 = true;
                var _didIteratorError7 = false;
                var _iteratorError7 = undefined;

                try {
                    for (var _iterator7 = birds[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                        var bird = _step7.value;

                        // Very very hacky z-ordering of hit testing.
                        if (rectContainsMouse(bird.x - Bird.width() / 4.0, bird.y - Bird.height() / 4.0, Bird.width() / 2.0, Bird.height() / 2.0)) {
                            highlight = false;
                            break;
                        }
                    }
                } catch (err) {
                    _didIteratorError7 = true;
                    _iteratorError7 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion7 && _iterator7["return"]) {
                            _iterator7["return"]();
                        }
                    } finally {
                        if (_didIteratorError7) {
                            throw _iteratorError7;
                        }
                    }
                }
            }

            if (highlight) {
                cursor = "pointer";
            }

            if (Mouse.pressed && (highlight && Mouse.target === undefined || Mouse.target === this)) {
                this.pressed = highlight;
                Mouse.target = this.pressed ? this : undefined;
            } else if (this.pressed && !Mouse.pressed && Mouse.target === this) {
                if (this.bird !== null) {
                    this.bird.flyAway();
                } else {
                    // Find a flying bird; make it fly here.
                    var _iteratorNormalCompletion8 = true;
                    var _didIteratorError8 = false;
                    var _iteratorError8 = undefined;

                    try {
                        for (var _iterator8 = birds[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
                            var bird = _step8.value;

                            if (bird.flying && bird.active) {
                                this.landBirdHere(bird);
                                break;
                            }
                        }
                    } catch (err) {
                        _didIteratorError8 = true;
                        _iteratorError8 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion8 && _iterator8["return"]) {
                                _iterator8["return"]();
                            }
                        } finally {
                            if (_didIteratorError8) {
                                throw _iteratorError8;
                            }
                        }
                    }

                    this.prompt = false;
                }

                this.pressed = false;
                Mouse.target = undefined;
            }
            this.lastPressed = Mouse.pressed;

            var highlightAlpha = 0.0;
            if (this.pressed) {
                highlightAlpha = 1.0;
            } else if (this.prompt) {
                highlightAlpha = (Math.sin(Date.now() / 190) + 1.0) / 2.0;
            }
            this.image.style.opacity = highlightAlpha * 0.5;
        }
    }, {
        key: "landBirdHere",
        value: function landBirdHere(bird) {
            this.bird = bird;
            bird.landAt(this.originX + Post.width() / 2.0, this.originY - 15);
            bird.post = this;
        }
    }], [{
        key: "width",
        value: function width() {
            return 70;
        }
    }, {
        key: "height",
        value: function height() {
            return 182;
        }
    }]);

    return Post;
})();

var Wave = (function () {
    function Wave(waveElement) {
        _classCallCheck(this, Wave);

        this.waveElement = waveElement;
        this.frequency = 1000 + Math.random() % 1000;
        this.amplitudeX = 25;
        this.amplitudeY = 10;
    }

    _createClass(Wave, [{
        key: "update",
        value: function update() {
            setTransform(this.waveElement, "translate(" + Math.sin(Date.now() / this.frequency) * this.amplitudeX + "px, " + Math.cos(Date.now() / this.frequency) * this.amplitudeY + "px)");
        }
    }]);

    return Wave;
})();

var ScrollDownArrow = (function () {
    _createClass(ScrollDownArrow, null, [{
        key: "centerX",
        value: function centerX() {
            return canvas.width / 2.0;
        }
    }]);

    function ScrollDownArrow(y) {
        _classCallCheck(this, ScrollDownArrow);

        this.element = document.getElementById("scroll-down");
        this.height = this.element.height;

        this.anchorY = y;
        this.enabled = false;
        this.alpha = 0;
        this.targetAlpha = 0;

        this.targetScale = 1.0;
        this.scale = 1.0;
    }

    _createClass(ScrollDownArrow, [{
        key: "update",
        value: function update() {
            this.x = ScrollDownArrow.centerX();
            this.y = this.anchorY + Math.sin(Date.now() / 1000) * 25;

            var targetAlpha = this.enabled ? 1.0 : 0.0;
            var alphaSpeed = 0.2;
            this.targetAlpha = this.targetAlpha * (1.0 - alphaSpeed) + targetAlpha * alphaSpeed;
            var newAlpha = this.targetAlpha * (1.0 - Math.min(1.0, Math.max(0.0, (window.scrollY - (this.anchorY - this.height)) / 100.0)));

            var newTransform = undefined;
            if (newAlpha > 0 || this.alpha !== 0 && newAlpha === 0) {
                this.alpha = newAlpha;
                newTransform = "translate(" + this.x + "px, " + this.y + "px)";
                this.element.style.opacity = this.alpha;
            }

            var highlight = rectContainsMouse(this.x, this.y, this.element.width, this.element.height);
            var highlightedScale = 1.15;
            this.targetScale = highlight && !Mouse.pressed ? highlightedScale : 1.0;
            var newScale = this.scale * 0.85 + this.targetScale * 0.15;
            newTransform += " scale(" + this.scale + ")";
            this.scale = Math.abs(newScale - 1.0) < 0.01 ? 1.0 : newScale;

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
    }]);

    return ScrollDownArrow;
})();

var PowerLine = (function () {
    _createClass(PowerLine, null, [{
        key: "highlightImage",
        value: function highlightImage() {
            if (this._highlightImage === undefined) {
                this._highlightImage = loadImage("power-line-brightener");
            }
            return this._highlightImage;
        }
    }, {
        key: "missingBirdImage",
        value: function missingBirdImage() {
            if (this._missingBirdImage === undefined) {
                this._missingBirdImage = loadImage("bird-outline-prompt");
            }
            return this._missingBirdImage;
        }
    }]);

    function PowerLine(centerX, centerY, radius, firstDotX, firstDotY, secondDotX, secondDotY, beamX, beamY, otherPowerLinesToCount) {
        _classCallCheck(this, PowerLine);

        this.missingBirdElements = [];
        for (var missingBirdIndex = 0; missingBirdIndex < 10; missingBirdIndex++) {
            var missingBirdImage = document.createElement("img");
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
        var firstDotAngle = Math.atan2(this.centerY - firstDotY, firstDotX - this.centerX);
        var secondDotAngle = Math.atan2(this.centerY - secondDotY, secondDotX - this.centerX);
        var dotSpacingAngle = secondDotAngle - firstDotAngle;

        this.dotPoints = new Array(10);
        for (var dotIndex = 0; dotIndex < 10; dotIndex++) {
            // The dots aren't actually spaced in even arc lengths along X. They're on the edge of a circle but spaced in even X amounts.
            var dotX = firstDotX + (secondDotX - firstDotX) * dotIndex;
            var dotY = this.centerY - this.radius * Math.sin(firstDotAngle + dotIndex * dotSpacingAngle);
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

    _createClass(PowerLine, [{
        key: "update",
        value: function update() {
            if (this.counter !== null) {
                var total = this.birds.length;
                var _iteratorNormalCompletion9 = true;
                var _didIteratorError9 = false;
                var _iteratorError9 = undefined;

                try {
                    for (var _iterator9 = this.otherPowerLinesToCount[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                        var otherPowerLine = _step9.value;

                        total += otherPowerLine.birds.length;
                    }
                } catch (err) {
                    _didIteratorError9 = true;
                    _iteratorError9 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion9 && _iterator9["return"]) {
                            _iterator9["return"]();
                        }
                    } finally {
                        if (_didIteratorError9) {
                            throw _iteratorError9;
                        }
                    }
                }

                this.counter.setValue(total);
                this.counter.update();
            }
            if (!this.enabled) {
                return;
            }

            var highlight = rectContainsMouse(this.beamX, this.beamY, PowerLine.highlightImage().width, PowerLine.highlightImage().height);
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
                    var _iteratorNormalCompletion10 = true;
                    var _didIteratorError10 = false;
                    var _iteratorError10 = undefined;

                    try {
                        for (var _iterator10 = this.birds[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                            var flyingBird = _step10.value;

                            flyingBird.flyAway();
                        }
                    } catch (err) {
                        _didIteratorError10 = true;
                        _iteratorError10 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion10 && _iterator10["return"]) {
                                _iterator10["return"]();
                            }
                        } finally {
                            if (_didIteratorError10) {
                                throw _iteratorError10;
                            }
                        }
                    }

                    this.birds = [];
                }

                this.pressed = false;
            }

            for (var birdIndex = 0; birdIndex < 10; birdIndex++) {
                var missingBirdElement = this.missingBirdElements[birdIndex];

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

            var oldHighlightAlpha = this.highlightImage.oldAlpha;
            var highlightAlpha = 0.0;
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
    }, {
        key: "landBirdsHere",
        value: function landBirdsHere(landingBirds) {
            var _this2 = this;

            for (var birdIndex = 0; birdIndex < landingBirds.length && this.birds.length < 10; birdIndex++) {
                var bird = landingBirds[birdIndex];
                if (bird.flying && bird.active) {
                    var dotPoint = this.dotPoints[this.birds.length];
                    bird.landAt(dotPoint[0], dotPoint[1] - 15);
                    bird.powerLine = this;
                    this.birds.push(bird);
                }
            }
            this.landingTime = Date.now();

            if (this.birds.length < 10) {
                suppressNextBirdSequence = true;
                setTimeout(function () {
                    suppressNextBirdSequence = false;
                    var _iteratorNormalCompletion11 = true;
                    var _didIteratorError11 = false;
                    var _iteratorError11 = undefined;

                    try {
                        for (var _iterator11 = _this2.birds[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                            var bird = _step11.value;

                            bird.flyAway();
                        }
                    } catch (err) {
                        _didIteratorError11 = true;
                        _iteratorError11 = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion11 && _iterator11["return"]) {
                                _iterator11["return"]();
                            }
                        } finally {
                            if (_didIteratorError11) {
                                throw _iteratorError11;
                            }
                        }
                    }

                    _this2.birds = [];
                }, 1600);
            }
        }
    }, {
        key: "draw",
        value: function draw() {
            if (this.counter !== null) {
                this.counter.draw();
            }
        }
    }, {
        key: "setEnabled",
        value: function setEnabled(newValue) {
            this.enabled = newValue;
            if (this.counter !== null) {
                this.counter.enabled = newValue;
            }
        }
    }]);

    return PowerLine;
})();

var PlayAgain = (function () {
    function PlayAgain() {
        var _this3 = this;

        _classCallCheck(this, PlayAgain);

        this.element = document.getElementById("play-again");
        this.youDidIt = document.getElementById("you-did-it");
        this.active = false;
        this.y = 3600;

        var makeBird = function makeBird(parentNode) {
            var bird = new Bird(0, 0);
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
            var sittingBird = makeBird(this.element);
            sittingBird.flying = false;
            sittingBird.canSing = false;
            this.sittingBirds.push(sittingBird);
        }

        document.getElementById("play-again-link").onclick = function (event) {
            _this3.playAgain();
            event.preventDefault();
            event.stopPropagation();
        };

        this.hue = 0;

        this.blackout = document.getElementById("blackout");
        this.lastBlackoutAlpha = 0;
    }

    _createClass(PlayAgain, [{
        key: "playAgain",
        value: function playAgain() {
            this.active = false;

            var _iteratorNormalCompletion12 = true;
            var _didIteratorError12 = false;
            var _iteratorError12 = undefined;

            try {
                for (var _iterator12 = birds[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
                    var flyingBird = _step12.value;

                    if (flyingBird.active) {
                        flyingBird.flyAway();
                        flyingBird.targetY = 3600;
                        flyingBird.active = false;
                    }
                }
            } catch (err) {
                _didIteratorError12 = true;
                _iteratorError12 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion12 && _iterator12["return"]) {
                        _iterator12["return"]();
                    }
                } finally {
                    if (_didIteratorError12) {
                        throw _iteratorError12;
                    }
                }
            }

            var _iteratorNormalCompletion13 = true;
            var _didIteratorError13 = false;
            var _iteratorError13 = undefined;

            try {
                for (var _iterator13 = powerLines[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                    var powerLine = _step13.value;

                    powerLine.birds = [];
                }
            } catch (err) {
                _didIteratorError13 = true;
                _iteratorError13 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion13 && _iterator13["return"]) {
                        _iterator13["return"]();
                    }
                } finally {
                    if (_didIteratorError13) {
                        throw _iteratorError13;
                    }
                }
            }

            setTimeout(function () {
                var _iteratorNormalCompletion14 = true;
                var _didIteratorError14 = false;
                var _iteratorError14 = undefined;

                try {
                    for (var _iterator14 = birds[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
                        var flyingBird = _step14.value;

                        flyingBird.element.parentNode.removeChild(flyingBird.element);
                    }
                } catch (err) {
                    _didIteratorError14 = true;
                    _iteratorError14 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion14 && _iterator14["return"]) {
                            _iterator14["return"]();
                        }
                    } finally {
                        if (_didIteratorError14) {
                            throw _iteratorError14;
                        }
                    }
                }

                birds = [];
                skySpots.fill(false);
                setCurrentStage("combined");
            }, 2000);
        }
    }, {
        key: "update",
        value: function update() {
            var targetY = this.active ? 2300 : 3600;
            var newY = this.y * 0.9 + targetY * 0.1;
            if (Math.abs(this.y - newY) > 0.1) {
                this.element.style.top = newY + "px";
            }

            if (this.y < 3400 && newY > 3400 && !this.active) {
                this.element.style.display = "none";
                this.blackout.style.display = "none";
            }

            var blackoutTargetAlpha = this.active ? 1 : 0;
            var newBlackoutAlpha = this.lastBlackoutAlpha * 0.9 + blackoutTargetAlpha * 0.1;
            if (Math.abs(this.lastBlackoutAlpha - newBlackoutAlpha) > 0.01) {
                this.blackout.style.opacity = newBlackoutAlpha;
                this.lastBlackoutAlpha = newBlackoutAlpha;
            }

            this.y = newY;

            if (this.active) {
                this.carryingBird1.update();
                this.carryingBird2.update();

                setTransform(this.element, "translate(" + this.carryingBird1.x + "px, " + this.carryingBird1.y + "px) rotate(" + this.carryingBird1.angle + "rad)");

                var y = -397;
                setTransform(this.carryingBird1.element, "translate(-65px, " + y + "px)");
                setTransform(this.carryingBird2.element, "translate(318px, " + y + "px)");

                var _iteratorNormalCompletion15 = true;
                var _didIteratorError15 = false;
                var _iteratorError15 = undefined;

                try {
                    for (var _iterator15 = this.sittingBirds[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
                        var sittingBird = _step15.value;

                        sittingBird.update();
                    }
                } catch (err) {
                    _didIteratorError15 = true;
                    _iteratorError15 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion15 && _iterator15["return"]) {
                            _iterator15["return"]();
                        }
                    } finally {
                        if (_didIteratorError15) {
                            throw _iteratorError15;
                        }
                    }
                }

                setTransform(this.sittingBirds[0].element, "translate(20px, " + y + "px) rotate(" + this.sittingBirds[0].angle + "rad)");
                setTransform(this.sittingBirds[1].element, "translate(130px, " + y + "px) rotate(" + this.sittingBirds[1].angle + "rad)");
                setTransform(this.sittingBirds[2].element, "translate(210px, " + y + "px) rotate(" + this.sittingBirds[2].angle + "rad)");

                this.unhelpfulBird1.update();
                this.unhelpfulBird2.update();
                setTransform(this.unhelpfulBird1.element, "translate(" + (-105 + this.unhelpfulBird1.x) + "px, " + (-265 + this.unhelpfulBird1.y) + "px) rotate(" + (-this.carryingBird1.angle + this.unhelpfulBird1.angle) + "rad)");
                setTransform(this.unhelpfulBird2.element, "translate(" + (350 + this.unhelpfulBird2.x) + "px, " + (-160 + this.unhelpfulBird2.y) + "px) rotate(" + (-this.carryingBird1.angle + this.unhelpfulBird2.angle) + "rad)");

                this.hue = (this.hue + 2) % 360;
                this.youDidIt.style.color = "hsl(" + this.hue + ", 90%, 60%)";
            }
        }
    }, {
        key: "active",
        set: function set(newValue) {
            if (newValue) {
                this.element.style.display = "block";
                this.blackout.style.display = "block";
            }
            Mouse.enabled = !newValue;

            this._active = newValue;
        },
        get: function get() {
            return this._active;
        }
    }]);

    return PlayAgain;
})();

var birds = [];

var onesPosts = [];
var firstFence = document.getElementById("first-fence");
for (var postIndex = 0; postIndex < 9; postIndex++) {
    onesPosts.push(new Post(firstFence, firstFencePostOriginX + postIndex * (Post.width() + fencePostSpacing), onesFencePostY));
}
onesPosts[0].prompt = true;
var combinedPosts = [];

var waves = [];
var waveElements = document.querySelectorAll(".wave");
for (var waveIndex = 0; waveIndex < waveElements.length; waveIndex++) {
    waves.push(new Wave(waveElements.item(waveIndex)));
}

var powerLine1 = new PowerLine(755, -484, 1788.5, 298.5, 1248, 374.5, 1266, 27, 1208);
var powerLine2 = new PowerLine(755, -410, 1788.5, 298.5, 1320, 374.5, 1338, 27, 1279);
var powerLine3 = new PowerLine(755, -338, 1788.5, 298.5, 1392, 374.5, 1410, 27, 1349, [powerLine1, powerLine2]);
var powerLine4 = new PowerLine(726, 157, 1998.5, 221, 2082, 297, 2104, -43, 2056);
var powerLine5 = new PowerLine(726, 220, 1998.5, 221, 2155, 297, 2177, -43, 2126);
var powerLine6 = new PowerLine(726, 297.5, 1998.5, 221, 2229, 297, 2259, -43, 2196, [powerLine4, powerLine5]);

var powerLines = [powerLine1, powerLine2, powerLine3, powerLine4, powerLine5, powerLine6];
for (var i = 0; i < 6; i++) {
    powerLines[i].setEnabled(false);
}
var scrollDownArrow = new ScrollDownArrow(680);

var playAgain = new PlayAgain();

var currentStage = undefined;
setCurrentStage("ones");
// setCurrentStage("transition-to-tens");
// setCurrentStage("tens");
// setCurrentStage("transition-to-combined");
// setCurrentStage("combined");
// setCurrentStage("complete");
var numberOfBirdsWhenStartingCombinedStage = undefined;

function goToNextStage() {
    var transitions = {
        "ones": "transition-to-tens",
        "transition-to-tens": "tens",
        "tens": "transition-to-combined",
        "transition-to-combined": "combined",
        "combined": "complete"
    };
    setCurrentStage(transitions[currentStage]);
}

function setCurrentStage(newStage) {
    switch (newStage) {
        case "transition-to-tens":
            for (var birdIndex = birds.length; birdIndex < 10; birdIndex++) {
                addBird();
            }
            setTimeout(function () {
                scrollDownArrow.enabled = true;
            }, 2500);
            break;
        case "tens":
            skySlotsY = tensSkySlotsY;
            var _iteratorNormalCompletion16 = true;
            var _didIteratorError16 = false;
            var _iteratorError16 = undefined;

            try {
                for (var _iterator16 = birds[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
                    var bird = _step16.value;

                    bird.flyAway();
                }
            } catch (err) {
                _didIteratorError16 = true;
                _iteratorError16 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion16 && _iterator16["return"]) {
                        _iterator16["return"]();
                    }
                } finally {
                    if (_didIteratorError16) {
                        throw _iteratorError16;
                    }
                }
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

            var secondFence = document.getElementById("second-fence");
            for (var postIndex = 0; postIndex < 9; postIndex++) {
                combinedPosts.push(new Post(secondFence, firstFencePostOriginX + postIndex * (Post.width() + fencePostSpacing), combinedFencePostY));
            }
            combinedFencePostCounter.enabled = true;

            skySlotsY = combinedSkySlotsY;
            birdsFlyingCounter.targetY = skySlotsY + 20;

            for (var birdIndex = 0; birdIndex < 30 && birdIndex < birds.length; birdIndex++) {
                var _bird = birds[birdIndex];
                _bird.targetX = Math.random() > 0.5 ? -canvas.width / 6.0 : canvas.width * 1.15;
                skySpots[_bird.positionIndex] = false;
                _bird.active = false;
            }
            for (var birdIndex = birds.length; birdIndex < 5; birdIndex++) {
                addBird();
            }

            var _iteratorNormalCompletion17 = true;
            var _didIteratorError17 = false;
            var _iteratorError17 = undefined;

            try {
                for (var _iterator17 = birds[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
                    var flyingBird = _step17.value;

                    if (flyingBird.active) {
                        flyingBird.flyAway();
                    }
                }
            } catch (err) {
                _didIteratorError17 = true;
                _iteratorError17 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion17 && _iterator17["return"]) {
                        _iterator17["return"]();
                    }
                } finally {
                    if (_didIteratorError17) {
                        throw _iteratorError17;
                    }
                }
            }

            totalCounter.targetY = 2700;
            numberOfBirdsWhenStartingCombinedStage = birds.length;

            break;
        case "complete":
            setTimeout(function () {
                playAgain.active = true;
            }, 2000);
            break;
    }
    currentStage = newStage;
}

function addBird() {
    var bird = new Bird(-Bird.width(), skySlotsY);
    bird.flyAway();
    birds.push(bird);
}

var dateWhenSkyEmptied = null;

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

    var _iteratorNormalCompletion18 = true;
    var _didIteratorError18 = false;
    var _iteratorError18 = undefined;

    try {
        for (var _iterator18 = onesPosts[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
            var post = _step18.value;

            post.update();
        }
    } catch (err) {
        _didIteratorError18 = true;
        _iteratorError18 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion18 && _iterator18["return"]) {
                _iterator18["return"]();
            }
        } finally {
            if (_didIteratorError18) {
                throw _iteratorError18;
            }
        }
    }

    var _iteratorNormalCompletion19 = true;
    var _didIteratorError19 = false;
    var _iteratorError19 = undefined;

    try {
        for (var _iterator19 = waves[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
            var wave = _step19.value;

            wave.update();
        }
    } catch (err) {
        _didIteratorError19 = true;
        _iteratorError19 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion19 && _iterator19["return"]) {
                _iterator19["return"]();
            }
        } finally {
            if (_didIteratorError19) {
                throw _iteratorError19;
            }
        }
    }

    var _iteratorNormalCompletion20 = true;
    var _didIteratorError20 = false;
    var _iteratorError20 = undefined;

    try {
        for (var _iterator20 = combinedPosts[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
            var post = _step20.value;

            post.update();
        }
    } catch (err) {
        _didIteratorError20 = true;
        _iteratorError20 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion20 && _iterator20["return"]) {
                _iterator20["return"]();
            }
        } finally {
            if (_didIteratorError20) {
                throw _iteratorError20;
            }
        }
    }

    var _iteratorNormalCompletion21 = true;
    var _didIteratorError21 = false;
    var _iteratorError21 = undefined;

    try {
        for (var _iterator21 = birds[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
            var bird = _step21.value;

            bird.update();
        }
    } catch (err) {
        _didIteratorError21 = true;
        _iteratorError21 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion21 && _iterator21["return"]) {
                _iterator21["return"]();
            }
        } finally {
            if (_didIteratorError21) {
                throw _iteratorError21;
            }
        }
    }

    var numberOfBirdsInSky = skySpots.filter(function (el) {
        return el === true;
    }).length;
    if (numberOfBirdsInSky === 0 && !suppressNextBirdSequence) {
        if (birds.length === 0 || dateWhenSkyEmptied !== null && Date.now() - dateWhenSkyEmptied > 750) {
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
                var sequence = [8, 3, 7, 5, 9, 2];
                var accumulator = numberOfBirdsWhenStartingCombinedStage;
                var _iteratorNormalCompletion22 = true;
                var _didIteratorError22 = false;
                var _iteratorError22 = undefined;

                try {
                    for (var _iterator22 = sequence[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
                        var quantity = _step22.value;

                        if (birds.length >= accumulator && birds.length < accumulator + quantity) {
                            for (var i = 0; i < quantity; i++) {
                                addBird();
                            }
                            break;
                        }
                        accumulator += quantity;
                    }
                } catch (err) {
                    _didIteratorError22 = true;
                    _iteratorError22 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion22 && _iterator22["return"]) {
                            _iterator22["return"]();
                        }
                    } finally {
                        if (_didIteratorError22) {
                            throw _iteratorError22;
                        }
                    }
                }

                if (accumulator === numberOfBirdsWhenStartingCombinedStage + sequence.reduce(function (acc, el) {
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

    var _iteratorNormalCompletion23 = true;
    var _didIteratorError23 = false;
    var _iteratorError23 = undefined;

    try {
        for (var _iterator23 = powerLines[Symbol.iterator](), _step23; !(_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done); _iteratorNormalCompletion23 = true) {
            var powerLine = _step23.value;

            powerLine.update();
            powerLine.draw();
        }
    } catch (err) {
        _didIteratorError23 = true;
        _iteratorError23 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion23 && _iterator23["return"]) {
                _iterator23["return"]();
            }
        } finally {
            if (_didIteratorError23) {
                throw _iteratorError23;
            }
        }
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

var cursor = "initial";
var lastCursor = cursor;

function applyCursor() {
    if (cursor !== lastCursor) {
        rootContainer.style.cursor = cursor;
        lastCursor = cursor;
    }
}

function rectContainsMouse(x, y, width, height) {
    return Mouse.x >= x && Mouse.y >= y && Mouse.x < x + width && Mouse.y < y + height;
}

function setTransform(element, transformString) {
    element.style.transform = transformString;
    element.style.webkitTransform = transformString;
}

var sizeWarning = document.getElementById("size-warning");
var sizeWarningText = document.getElementById("size-warning-text");
window.onresize = function () {
    var minWidth = 1000;
    var minHeight = 680;

    if (window.screen.availWidth < minWidth || window.screen.availHeight < minHeight) {
        sizeWarningText.innerHTML = "We're sorry, but this screen is too small for this activity. Please give it a try on a device with a larger screen.";
        sizeWarning.style.display = "block";
    } else {
        sizeWarning.style.display = window.innerWidth < 1000 || window.innerHeight <= 680 ? "block" : "none";
        var scalingFactor = Math.min(1.0, Math.max(1000, window.innerWidth) / 1366);
        Mouse.scalingFactor = scalingFactor;
        rootContainer.style.transform = "scale(" + scalingFactor + ")";
    }
};
window.onresize();

window.requestAnimFrame = window.requestAnimationFrame || function (callback) {
    window.setTimeout(callback, 1000 / 60);
};
(function animloop() {
    requestAnimFrame(animloop);
    drawScene();
})();
//# sourceMappingURL=app.js.map
