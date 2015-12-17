function Bar () {
	this.x = 0;
	this.y = 0;
	this.pitch = 0;
	this.x_ = 0;
	this.y_ = 0;
	this.playing = false;
	this.complete = false;
	this.initAudio = function(audioContext) {
		this.oscillators = [
			audioContext.createOscillator(),
			audioContext.createOscillator(),
			audioContext.createOscillator()
		];

		this.lowpass = audioContext.createBiquadFilter();
		this.gain = audioContext.createGain();

		for(var i = 0; i < this.oscillators.length; i++) {
			this.oscillators[i].frequency.value = 0;
			this.oscillators[i].detune.value = 0;
			this.oscillators[i].type = i == 0 ? 'triangle' : i == 1 ? 'sawtooth' : 'sine';
			this.oscillators[i].connect(this.lowpass);
			this.oscillators[i].start(0);
		}

		this.lowpass.type = this.lowpass.ALLPASS;
		this.lowpass.frequency.value = 5000;
		this.lowpass.Q.value = 35;
		this.lowpass.connect(this.gain);

		this.gain.gain.value = 0.1;
		this.gain.connect(audioContext.destination);

	};
	this.swap = function() {
		var temp_x = this.x;
		var temp_y = this.y;
		this.x = this.x_;
		this.y = this.y_;
		this.x_ = temp_x;
		this.y_ = temp_y;
	};
	this.updatePitch = function(x) {
		var a = this.y - this.y_;
		var b = this.x_ - this.x;
		var c = (this.x - this.x_) * this.y + (this.y_ - this.y) * this.x;
		this.pitch = Math.round((-(a * x) - c) / b);

		if (this.playing) this.gain.gain.value = 0.1;
		else this.gain.gain.value = 0;
		for(var i = 0; i < this.oscillators.length; i++) {
			if (this.playing) {
				var canvas = document.getElementById("canvas");
				this.oscillators[i].frequency.value = (canvas.height - this.pitch) / canvas.height * 1500;
			}
			else {
				this.oscillators[i].frequency.value = 0;
			}
		}
	};
}

var bars = []
var placeFlag = false;
var play_pos = 0;
var play = false;
var tempo = .2;


function isGoodNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n) && n > 0 && n < 10;
}

function initialize() {
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	if(!window.AudioContext) { return; }

	var canvas = document.getElementById("canvas");
	var play_btn = document.getElementById("play-pause");
	var clear_btn = document.getElementById("clear");
	var undo_btn = document.getElementById("undo");
	var tempo_field = document.getElementById("tempo");
	canvas.width = Math.round(window.innerWidth * .9);
	canvas.height = Math.round(window.innerHeight * .8);

	console.log(window.innerWidth, window.innerHeight);

	audioContext = new window.AudioContext();
	canvas.addEventListener("mousedown", function(e) { 
		getPosition(e, audioContext);
	}, false);

	window.addEventListener("keyup", undo, false);
	undo_btn.addEventListener("click", undo, false);
	play_btn.addEventListener("click", function(e) {
		for (var i = 0; i < bars.length; i++) {
			bars[i].gain.gain.value = 0;
		}
		play = !play;
		play_btn.innerHTML = play_btn.innerHTML == "Play" ? "Pause" : "Play";
	}, false);
	clear_btn.addEventListener("click", function(e) {
		for(var i = 0; i < bars.length; i++) {
			bars[i].gain.gain.value = 0;
		}
		bars = [];
		placeFlag = false; //check here for bug
	}, false);
	tempo_field.addEventListener("input", function(e) {
		if (isGoodNumber(tempo_field.value)) tempo = tempo_field.value;
		console.log(tempo_field.value, tempo);
	}, false);

	window.setInterval(update, 1000 / 60, canvas);
	
	console.log("initialized");
}

function undo(event) {
	if(( event.keyCode == 27 || event.type == "click" ) && bars.length > 0) {
		bars[bars.length - 1].gain.gain.value = 0;
		bars.pop();
		placeFlag = false;
	}
}

function getPosition(event, audioContext) {

	var canvas = document.getElementById("canvas");
	var rect = canvas.getBoundingClientRect();

	var x = Math.round((event.clientX-rect.left)/(rect.right-rect.left)*canvas.width);
	var y = Math.round((event.clientY-rect.top)/(rect.bottom-rect.top)*canvas.height);

	if (placeFlag) {
		var bar = bars[bars.length - 1];
		bar.x_ = x;
		bar.y_ = y;
		bar.pitch = bar.y;
		bar.complete = true;
		if (bar.x_ < bar.x) bar.swap();
		else if (bar.x_ == bar.x) bars.pop()
		placeFlag = false;
	}
	else {
		var bar = new Bar();
		bar.x = x;
		bar.y = y;
		bar.complete = false;
		bar.initAudio(audioContext);
		bars.push(bar);
		placeFlag = true;
	}

}

function update(canvas) {
	if (play) {
		for (var i = 0; i < bars.length; i++){
			if (play_pos >= bars[i].x && play_pos <= bars[i].x_) bars[i].playing = true;
			else bars[i].playing = false;
			bars[i].updatePitch(play_pos);
		}
		var dx = Math.round(canvas.width / 60 * tempo); 
		play_pos = play_pos + dx < canvas.width ? play_pos + dx : 0;
	}

	draw(canvas);
}

function draw(canvas) {
	var context = canvas.getContext("2d");

	context.clearRect(0, 0, canvas.width, canvas.height);
	context.save();

	context.lineWidth = 2;
	context.strokeStyle = "#D1D1D1";

	context.save();
	context.translate(Math.round(canvas.width / (2 * 10)), 0);
	for (var i = 0; i < 10; i++) {
		context.beginPath();
		context.moveTo(0, 20);
		context.lineTo(0, canvas.height - 20);
		context.stroke();
		context.closePath();
		context.translate(Math.round(canvas.width / 10), 0);
	}
	context.restore();

	context.lineWidth = 5;
	context.strokeStyle = "grey";
	for (var i = 0; i < bars.length; i++) {
		if (bars[i].complete) {		
			context.beginPath();
			context.moveTo(bars[i].x, bars[i].y);
			context.lineTo(bars[i].x_, bars[i].y_)
			context.stroke();
			context.closePath();

			if(bars[i].playing) {
				context.beginPath();
				context.arc(play_pos, bars[i].pitch, 7, 2 * Math.PI, false);
				context.fillStyle = "red";
				context.fill();
				context.closePath();
			}
		}
		else {
			context.beginPath();
			context.arc(bars[i].x, bars[i].y, 5, 2 * Math.PI, false);
			context.fillStyle = "grey";
			context.fill();
			context.closePath();
		}
	}

	context.strokeStyle = "red";
	context.lineWidth = 3;
	context.beginPath();
	context.moveTo(play_pos, 0);
	context.lineTo(play_pos, canvas.height);
	context.stroke();
	context.closePath();

	context.restore();
}

window.onload = initialize;