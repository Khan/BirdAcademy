// Borrowed from Parable of the Polygons by Vi Hart and Nicky Case!

(function(exports){

	// Singleton
	var Mouse = {
		x: 0,
		y: 0,
		pressed: false
	};
	exports.Mouse = Mouse;

	var canvas = window;

	// Event Handling
	var onMouseMove,onTouchMove;

	// Cursor
	Mouse.isOverDraggable = false;
	function updateCursor(){
	}

	function fixPosition(){
		//return;
		/*var BORDER = PEEP_SIZE/2;
		if(Mouse.x<BORDER) Mouse.x=BORDER;
		if(Mouse.x>canvas.width-BORDER) Mouse.x=canvas.width-BORDER;
		if(Mouse.y<BORDER) Mouse.y=BORDER;
		if(Mouse.y>canvas.height-BORDER) Mouse.y=canvas.height-BORDER;*/
		// Looks a bit weird?... Esp if offset-grab...
	}
	
	canvas.addEventListener("mousedown",function(event){
		updateCursor();
	    Mouse.pressed = true;
	    onMouseMove(event);
	    event.preventDefault();
	    event.stopPropagation();
	},false);

	canvas.addEventListener("mouseup",function(event){
		updateCursor();
	    Mouse.pressed = false;
	    event.preventDefault();
	    event.stopPropagation();
	},false);

	canvas.addEventListener("mousemove",onMouseMove = function(event){
		updateCursor();
		Mouse.x = event.pageX;
		Mouse.y = event.pageY;
		fixPosition();
		event.preventDefault();
	    event.stopPropagation();

	},false);

	canvas.addEventListener("touchstart",function(event){
	    Mouse.pressed = true;
	    onTouchMove(event);
	    event.preventDefault();
	    event.stopPropagation();
	},false);

	canvas.addEventListener("touchend",function(event){
	    Mouse.pressed = false;
	    event.preventDefault();
	    event.stopPropagation();
	},false);

	canvas.addEventListener("touchmove",onTouchMove = function(event){
		Mouse.x = event.changedTouches[0].clientX;
		Mouse.y = event.changedTouches[0].clientY;
		fixPosition();
		event.preventDefault();
	    event.stopPropagation();
	},false);


})(window);