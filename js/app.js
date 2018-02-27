// Setup app
var appWidth = 800;
var appHeight = 650;
var app = new PIXI.Application(appWidth, appHeight, {backgroundColor : 0x1099bb});
document.body.appendChild(app.view);
var globalTimer = 0; // Updated by 1 every frame (runs at 60 fps)
var running = true;

// Setup keys (see keyboard.js and https://help.adobe.com/en_US/AS2LCR/Flash_10.0/help.html?content=00000520.html)
var left_key = keyboard(37);	var up_key = keyboard(38);
var right_key = keyboard(39);	var down_key = keyboard(40);
var x_key = keyboard(88);		var z_key = keyboard(90);

// Setup something to show and something to control it
var centerText = new PIXI.Text("I'm handled through display");

function display(message) {
	centerText.destroy();
	centerText = new PIXI.Text(message);
	centerText.anchor.set(0.5);
	centerText.x = app.screen.width / 2;
	centerText.y = app.screen.height / 2;
	app.stage.addChild(centerText);
}

display("Press a key!");

// Main loop
app.ticker.add(function(delta) {
	if (running) {
		if((globalTimer % 60) == 0) { // Every second
			//console.log("DEBUG INFO");
		}
		// Left key
		if (leftKey.clicked || left_key.isDown) {
			display("pressed left");
		}
		// Up key
		if (upKey.clicked || up_key.isDown) {
			display("pressed up");
		}
		// Right key
		if (rightKey.clicked || right_key.isDown) {
			display("pressed right");
		}
		// Down key
		if (downKey.clicked || down_key.isDown) {
			display("pressed down");
		}
		// X key
		if (xKey.clicked || x_key.isDown) {
			display("pressed x");
		}
		// Z key
		if (zKey.clicked || z_key.isDown) {
			display("pressed z");
		}
		
		// Unclick (mobile vitual) keys for next frame - may be irrelevant
		var keys = [upKey, downKey, rightKey, leftKey, xKey, zKey];
		for (var i = 0; i < keys.length; i++) {
			keys[i].clicked = false;
		}
		// Simple global timer of frame count in case needed
		globalTimer++;
	}
});
