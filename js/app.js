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

// Setup main character
var mainChar = PIXI.Sprite.fromImage('content/MainCharacter.png');
mainChar.anchor.set(0.55); // Center anchor
mainChar.scale.x = 0.2;		mainChar.scale.y = 0.2; // Set size
mainChar.x = appWidth / 2;	mainChar.y = appHeight / 2; // Center to screen
app.stage.addChild(mainChar); // Add to app panel
mainChar.walking = false; // Whether currently walking
mainChar.direction = "right"; // What direction facing
mainChar.walkFrame = 0; // Frame to stop walking on

// Basic unit functions
var walkables = [mainChar];
function startWalk(character, direction) {
	if (!character.walking) {
		character.walking = true;
		character.direction = direction;
		character.walkFrame = globalTimer + 20;
	}
}

// Main loop
app.ticker.add(function(delta) {
	if (running) {
		if((globalTimer % 60) == 0) { // Every second
			//console.log("DEBUG INFO");
		}
		// Handle keys
		// Left key
		if (leftKey.clicked || left_key.isDown) {
			startWalk(mainChar, "left");
		}
		// Up key
		if (upKey.clicked || up_key.isDown) {
			startWalk(mainChar, "up");
		}
		// Right key
		if (rightKey.clicked || right_key.isDown) {
			startWalk(mainChar, "right");
		}
		// Down key
		if (downKey.clicked || down_key.isDown) {
			startWalk(mainChar, "down");
		}
		// X key
		if (xKey.clicked || x_key.isDown) {
			
		}
		// Z key
		if (zKey.clicked || z_key.isDown) {
			
		}
		
		// Handle walking
		for (var i = 0; i < walkables.length; i++) {
			if (walkables[i].walking){
				if (globalTimer < walkables[i].walkFrame){
					if (walkables[i].direction == "left") { walkables[i].x -= 2.5; }
					if (walkables[i].direction == "up")   { walkables[i].y -= 2.5; }
					if (walkables[i].direction == "right"){ walkables[i].x += 2.5; }
					if (walkables[i].direction == "down") { walkables[i].y += 2.5; }
				}
				else { walkables[i].walking = false; }
			}
		}
		
		// Unclick (mobile vitual) keys for next frame - may be irrelevant
		var keys = [upKey, downKey, rightKey, leftKey, xKey, zKey];
		for (var i = 0; i < keys.length; i++) {
			keys[i].clicked = false;
		}
		// Simple global timer of frame count
		globalTimer++;
	}
});
