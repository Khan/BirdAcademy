// Borrowed from Parable of the Polygons by Vi Hart and Nicky Case!

(function(exports){

	// Singleton
	var Mouse = {
	    x: 0,
	    y: 0,
	    pressed: false,
	    enabled: true
	};
	exports.Mouse = Mouse;

	var container = document.getElementById("bird-academy-container");

	// Event Handling
	var onMouseMove;
	var onTouchMove;

	// Cursor
	Mouse.isOverDraggable = false;

	function updateCursor() {}

	function fixPosition() {
	    const rect = container.getBoundingClientRect();
	    Mouse.x -= rect.left;
	    Mouse.y -= rect.top;
	    Mouse.x = Mouse.x / Mouse.scalingFactor;
	    Mouse.y = Mouse.y / Mouse.scalingFactor;
	}

	container.addEventListener("mousedown", function(event) {
	    if (!Mouse.enabled) {
	        return;
	    }
	    updateCursor();
	    Mouse.pressed = true;
	    onMouseMove(event);
	    event.preventDefault();
	    event.stopPropagation();
	}, false);

	container.addEventListener("mouseup", function(event) {
	    if (!Mouse.enabled) {
	        return;
	    }
	    updateCursor();
	    Mouse.pressed = false;
	    event.preventDefault();
	    event.stopPropagation();
	}, false);

	container.addEventListener("mousemove", onMouseMove = function(event) {
	    if (!Mouse.enabled) {
	        return;
	    }
	    updateCursor();
	    Mouse.x = event.clientX;
	    Mouse.y = event.clientY;
	    fixPosition();
	    event.preventDefault();
	    event.stopPropagation();
	}, false);

	container.addEventListener("touchstart", function(event) {
	    if (!Mouse.enabled) {
	        return;
	    }
	    Mouse.pressed = true;
	    onTouchMove(event);
	    // event.preventDefault();
	    // event.stopPropagation();
	}, false);

	container.addEventListener("touchend", function(event) {
	    if (!Mouse.enabled) {
	        return;
	    }
	    Mouse.pressed = false;
	    // event.preventDefault();
	    // event.stopPropagation();
	}, false);

	container.addEventListener("touchmove", onTouchMove = function(event) {
	    if (!Mouse.enabled) {
	        return;
	    }

	    Mouse.x = event.changedTouches[0].clientX;
	    Mouse.y = event.changedTouches[0].clientY;
	    fixPosition();
	    // event.preventDefault();
	    // event.stopPropagation();
	}, false);

})(window);