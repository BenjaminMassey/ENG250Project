// Setup app
var appWidth = 800;
var appHeight = 650;
var app = new PIXI.Application(appWidth, appHeight, {backgroundColor : 0x1099bb});
document.body.appendChild(app.view);
var globalTimer = 0; // Updated by 1 every frame (runs at 60 fps)
var activeTimer = 0; // Updated same as global - but only while active
var running = true;
var lastPress = 0; // Last frame a key was pressed

// FOR SOME REASON THIS DUMB THING CAN'T SEE OTHER FILES SO
// I'M PUTTING ALL THE FUNCTIONS HERE AAAAAAAAAAAAAAAAAAAAA
function generateFromSpritesheet(width, height, divX, divY, pathname) {
	var up = [];
	var down = [];
	var right = [];
	var left = [];
	var spriteSheet = new PIXI.Texture.fromImage(pathname);
	var rectangle;
	for (var i = 0; i < divX; i++) {
		rectangle = new PIXI.Rectangle((i * (width / divX)), 0, (width/divX), (height/divY));
		up[i] = new PIXI.Texture(spriteSheet, rectangle);
		rectangle = new PIXI.Rectangle((i * (width / divX)), (height/divY), (width/divX), (height/divY));
		right[i] = new PIXI.Texture(spriteSheet, rectangle);
		rectangle = new PIXI.Rectangle((i * (width / divX)), (2*height/divY), (width/divX), (height/divY));
		down[i] = new PIXI.Texture(spriteSheet, rectangle);
		rectangle = new PIXI.Rectangle((i * (width / divX)), (3*height/divY), (width/divX), (height/divY));
		left[i] = new PIXI.Texture(spriteSheet, rectangle);
	}
	var character = new PIXI.Sprite(right[0]);
	character.textures = {};
	character.textures.up = up;
	character.textures.down = down;
	character.textures.right = right;
	character.textures.left = left;
	return character;
}
function setupMainChar() {	
	mainChar = PIXI.Sprite.fromImage('content/characters/main/Right0.png');
	mainChar.tag = "main";
	mainChar.textures = {};
	mainChar.textures.up = [];
	mainChar.textures.down = [];
	mainChar.textures.right = [];
	mainChar.textures.left = [];
	for (var i = 0; i < 9; i++) {
		mainChar.textures.up[i] = PIXI.Texture.fromImage("/content/characters/main/up" + i + ".png");
		mainChar.textures.down[i] = PIXI.Texture.fromImage("/content/characters/main/down" + i + ".png");
		mainChar.textures.right[i] = PIXI.Texture.fromImage("/content/characters/main/right" + i + ".png");
		mainChar.textures.left[i] = PIXI.Texture.fromImage("/content/characters/main/left" + i + ".png");
	}
	mainChar.anchor.set(0.5); // Center anchor
	mainChar.scale.x = 1;		mainChar.scale.y = 1; // Set size
	mainChar.x = appWidth / 2;	mainChar.y = appHeight / 2; // Center to screen
	app.stage.addChild(mainChar); // Add to app panel
	mainChar.walking = false; // Whether currently walking
	mainChar.direction = "right"; // What direction facing
	mainChar.walkFrame = 0; // Frame to stop walking on
}
// END OF GROSS ALL FUNCTIONS IN HERE BS

// Setup keys (see keyboard.js and https://help.adobe.com/en_US/AS2LCR/Flash_10.0/help.html?content=00000520.html)
var left_key = keyboard(37);	var up_key = keyboard(38);
var right_key = keyboard(39);	var down_key = keyboard(40);
var x_key = keyboard(88);		var z_key = keyboard(90);

// Setup main character
var mainChar = {};
setupMainChar(); // See above

// Setup kitty kat :3
//var cat = {};
var cat = generateFromSpritesheet(96, 192, 3, 4, "content/characters/cat/spritesheet.png");
cat.tag = "cat";
cat.anchor.set(0.5);
cat.scale.x = 1.3;
cat.scale.y = 1.3;
cat.x = appWidth / 3;
cat.y = appHeight / 4;
app.stage.addChild(cat);
cat.walking = false;
cat.direction = "right";
cat.WalkFrame = 0;
cat.handleWalk = function() {
	if (!this.walking) {
		var num = Math.floor(Math.random() * 4);
		var direction = ["up","down","left","right"][num];
		startWalk(this, direction);
		this.walkStart += 60;
		this.walkEnd += 60;
	}
}

// Healer character
//var healer = {};
//setupHealer; // See healer.js


// Basic unit functions
var collisionChars = [mainChar, cat];
var walkables = [mainChar, cat];
function startWalk(character, direction) {
	if (!character.walking) {
		character.walking = true;
		character.direction = direction;
		character.walkStart = activeTimer;
		character.walkEnd = activeTimer + 30;
	}
}

// Main loop
app.ticker.add(function(delta) {
	if (running) {
		
		if((globalTimer % 60) == 0) { // Every second
			// DEBUG WHATEVER
		}

		if (textBox.active) {
			// Z key
			if ((zKey.clicked || z_key.isDown) && globalTimer > lastPress + 15) {
				lastPress = globalTimer;
				textBox.advance();
			}
		}
		else {
			// NPC idles
			cat.handleWalk();
			
			// Bad exception for active frame and global frame desync
			if (activeTimer < lastPress) {
				lastPress = 0;
			}
			// Handle player input
			if (activeTimer > lastPress + 10) {
				// Left key
				if (leftKey.clicked || left_key.isDown) {
					lastPress = activeTimer;
					startWalk(mainChar, "left");
				}
				// Up key
				if (upKey.clicked || up_key.isDown) {
					lastPress = activeTimer;
					startWalk(mainChar, "up");
				}
				// Right key
				if (rightKey.clicked || right_key.isDown) {
					lastPress = activeTimer;
					startWalk(mainChar, "right");
				}
				// Down key
				if (downKey.clicked || down_key.isDown) {
					lastPress = activeTimer;
					startWalk(mainChar, "down");
				}
				// X key
				if (xKey.clicked || x_key.isDown) {
					lastPress = activeTimer;
					textBox.create(["Oh hey there!", "This is a test of text boxes.", "Hopefully it worked!"]);
				}
				// Z key
				if (zKey.clicked || z_key.isDown) {
					lastPress = activeTimer;
					// Whatever Z key should do
				}
			}
			// Handle walking
			for (var i = 0; i < walkables.length; i++) {
				if (walkables[i].walking){
					if (activeTimer < walkables[i].walkEnd){
						var separations = walkables[i].textures.up.length; // Number of frames in walk animation
						var amount = Math.round((walkables[i].walkEnd - walkables[i].walkStart) / separations);
						// for+if makes it go through once for every animation frame j
						for (var j = 0; j < separations; j++) {
							if (activeTimer == (walkables[i].walkStart) + (j*amount)) {
								var start = {x: walkables[i].x, y: walkables[i].y};
								if (walkables[i].direction == "left") { 
									walkables[i].x -= 30 / separations;
									walkables[i].texture = walkables[i].textures.left[j];
								}
								if (walkables[i].direction == "up")   { 
									walkables[i].y -= 30 / separations;
									walkables[i].texture = walkables[i].textures.up[j];
								}
								if (walkables[i].direction == "right"){ 
									walkables[i].x += 30 / separations;
									walkables[i].texture = walkables[i].textures.right[j];
								}
								if (walkables[i].direction == "down") { 
									walkables[i].y += 30 / separations;
									walkables[i].texture = walkables[i].textures.down[j];
								}
								// Handle other character collision
								for (var k = 0; k < collisionChars.length; k++) {
									if (walkables[i] != collisionChars[k]) {
										// See hitdetection.js
										var collided = hitTestRectangle(walkables[i], collisionChars[k]);
										if (collided){
											walkables[i].x = start.x;
											walkables[i].y = start.y;
										}
									}
								}
								
								// Handle screen bounds
								var buffer = {
									l: walkables[i].texture.width / 3.5,
									r: walkables[i].texture.width / 3.5,
									t: walkables[i].texture.height / 3.5,
									b: walkables[i].texture.height / 2
								};
								if (walkables[i].x > appWidth - buffer.r) {
									walkables[i].x = appWidth - buffer.r;
								} 
								if (walkables[i].x < buffer.l) {
									walkables[i].x = buffer.l;
								}
								if (walkables[i].y > appHeight - buffer.b) {
									walkables[i].y = appHeight - buffer.b;
								}
								if (walkables[i].y < buffer.t) {
									walkables[i].y = buffer.t;
								}
							}
						}
						
					}
					else { walkables[i].walking = false; }
				}
			}
			// Simple timer for active frames
			activeTimer++;
			
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
