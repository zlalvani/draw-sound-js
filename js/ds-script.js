function Bar () {
	this.x = 0;
	this.y = 0;
	this.pitch = 0;
	this.x_ = 0;
	this.y_ = 0;
	this.playing = false;
	this.complete = false;
	this.swap = function() {
		var temp_x = this.x;
		var temp_y = this.y;
		this.x = this.x_;
		this.y = this.y_;
		this.x_ = temp_x;
		this.y_ = temp_y;
	}
};

//var currentBar = new Bar();
var bars = []
var placeFlag = false;
var play = false;

function initialize() {
	var canvas = document.getElementById("canvas");
	var play_btn = document.getElementById("play-pause");
	var clear_btn = document.getElementById("clear");
	canvas.width = Math.round(window.innerWidth * .9);
	canvas.height = Math.round(window.innerHeight * .8);

	console.log(window.innerWidth, window.innerHeight);

	canvas.addEventListener("mousedown", getPosition, false);
	play_btn.addEventListener("click", function(e) {

	});
	clear_btn.addEventListener("click", function(e) {
		bars = [];
		placeFlag = false; //check here for bug
	});
	window.setInterval(update, 1000 / 60, canvas);
	
	console.log("initialized");
}

function getPosition(event) {
	//var x = new Number();
	//var y = new Number();
	/*
	if (event.x != undefined && event.y != undefined) {
		x = event.x;
		y = event.y;
	}
	else {
		x = event.clientX + document.body.scrollLeft +
			document.documentElement.scrollLeft;
		y = event.clientY + document.body.scrollTop +
			document.documentElement.scrollTop;
	}
	*/

	var canvas = document.getElementById("canvas");
	var rect = canvas.getBoundingClientRect();
	/*
	x -= canvas.offsetLeft;
	y -= canvas.offsetTop;


	x = x - window.pageXOffset;
	y = y + window.pageYOffset;
	*/

	var x = Math.round((event.clientX-rect.left)/(rect.right-rect.left)*canvas.width);
	var y = Math.round((event.clientY-rect.top)/(rect.bottom-rect.top)*canvas.height);
	//console.log(x, y);
	if (placeFlag) {
		var bar = bars[bars.length - 1];
		bar.x_ = x;
		bar.y_ = y;
		//console.log(bars[bars.length - 1].x_, bars[bars.length - 1].y_);
		if (bar.x_ < bar.x) bar.swap();
		bar.complete = true;
		placeFlag = false;
	}
	else {
		var bar = new Bar();
		bar.x = x;
		bar.y = y;
		bar.complete = false;
		bars.push(bar);
		//bars[bars.length - 1]
		placeFlag = true;
	}
	//var context = canvas.getContext("2d");
	//context.fillRect(x - 3, y - 3, 6, 6);
}

function update(canvas) {


	draw(canvas);
}

function draw(canvas) {
	var context = canvas.getContext("2d");

	context.clearRect(0, 0, canvas.width, canvas.height);
	context.lineWidth = 5;
	context.strokeStyle = "grey";
	context.save();

	for (var i = 0; i < bars.length; i++) {
		if (bars[i].complete) {		
			context.beginPath();
			context.moveTo(bars[i].x, bars[i].y);
			//console.log(bars[i].x, bars[i].y);
			context.lineTo(bars[i].x_, bars[i].y_)
			context.stroke();
			context.closePath();
		}
	}

	context.restore();
}

window.onload = initialize;