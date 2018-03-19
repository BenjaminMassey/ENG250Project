// Setup app
var debug = true;
var appWidth = 800;
var appHeight = 650;
var app = new PIXI.Application(appWidth, appHeight, {backgroundColor : 0x1099bb});
document.body.appendChild(app.view);
var globalTimer = 0; // Updated by 1 every frame (runs at 60 fps)
var activeTimer = 0; // Updated same as global - but only while active (not textbox)
var running = true;
var lastPress = 0; // Last frame a key was pressed

// FOR SOME REASON THIS DUMB THING CAN'T SEE OTHER FILES SO
// I'M PUTTING ALL THE FUNCTIONS HERE AAAAAAAAAAAAAAAAAAAAA
function generateFromSpritesheet(startX, startY, width, height, divX, divY, pathname) {
	var up = [];
	var down = [];
	var right = [];
	var left = [];
	var spriteSheet = new PIXI.Texture.fromImage(pathname);
	var rectangle;
	for (var i = 0; i < divX; i++) {
		rectangle = new PIXI.Rectangle(startX + (i * (width / divX)), startY, (width/divX), (height/divY));
		up[i] = new PIXI.Texture(spriteSheet, rectangle);
		rectangle = new PIXI.Rectangle(startX + (i * (width / divX)), startY + (height/divY), (width/divX), (height/divY));
		right[i] = new PIXI.Texture(spriteSheet, rectangle);
		rectangle = new PIXI.Rectangle(startX + (i * (width / divX)), startY + (2*height/divY), (width/divX), (height/divY));
		down[i] = new PIXI.Texture(spriteSheet, rectangle);
		rectangle = new PIXI.Rectangle(startX + (i * (width / divX)), startY + (3*height/divY), (width/divX), (height/divY));
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
function generateFromTilesheet(startX, startY, width, height, divX, divY, pathname) {
	var tiles = [];
	var tileSheet = new PIXI.Texture.fromImage(pathname);
	var rectangle;
	var i = 0;
	for (var x = 0; x < divX; x++) {
		for (var y = 0; y < divY; y++) {
			//console.log("Starting (" + (startX + (x * (width / divX))) + ", " + (startY + (y * (height/divY))) + ") by " + (width/divX) + " and " + (height/divY))
			rectangle = new PIXI.Rectangle(startX + (x * (width / divX)), startY + (y * (height/divY)), (width/divX), (height/divY));
			tiles[i] = new PIXI.Texture(tileSheet, rectangle);
			i++;
		}
		i++;
	}
	return tiles;
}
function setupMainChar() {	
	mainChar = PIXI.Sprite.fromImage('content/characters/main/Right0.png');
	mainChar.tag = "main";
	mainChar.maxHP = 50;
	mainChar.HP = mainChar.maxHP;
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
	mainChar.boundsX = 15;
	mainChar.boundsY = 25;
	mainChar.x = appWidth / 2;	mainChar.y = appHeight / 2; // Center to screen
	app.stage.addChild(mainChar); // Add to app panel
	mainChar.walking = false; // Whether currently walking
	mainChar.direction = "right"; // What direction facing
	mainChar.walkFrame = 0; // Frame to stop walking on
	mainChar.checkInteraction = function() {
		// Define direction -> amount
		var amount = {x: 0, y: 0};
		if (this.facing == "right") { amount.x = 25; }
		if (this.facing == "left") { amount.x = -25; }
		if (this.facing == "up") { amount.y = 55; }
		if (this.facing == "down") { amount.y = -55; }
		// Setup blank sprite to be used as checker
		var checker = new PIXI.Sprite();
		checker.x = this.x + amount.x;
		checker.y = this.y + amount.y;
		checker.boundsX = 25;
		checker.boundsY = 35;
		app.stage.addChild(checker);
		// See if the checker hits anything
		var interact = "None";
		for (var i = 0; i < interactables.length; i++) {
			if (hitTestRectangle(interactables[i], checker)) {
				interact = interactables[i].tag;
			}
		}
		checker.destroy();
		return interact;
	}
}
// END OF GROSS ALL FUNCTIONS IN HERE BS

// Setup keys (see keyboard.js and https://help.adobe.com/en_US/AS2LCR/Flash_10.0/help.html?content=00000520.html)
var left_key = keyboard(37);	var up_key = keyboard(38);
var right_key = keyboard(39);	var down_key = keyboard(40);
var x_key = keyboard(88);		var z_key = keyboard(90);

// Setup tile sheets
var baseTiles = generateFromTilesheet(0, 0, 1024, 1024, 32, 32, "content/environment/main/base_out_atlas.png")
var darkBoringFloorTiles = [];
// Works out to be 26x21
var i = 0;
for (var x = 0; x < 26; x++) {
	for (var y = 0; y < 21; y++) {
		darkBoringFloorTiles[i] = new PIXI.Sprite(baseTiles[179]);
		darkBoringFloorTiles[i].tag = "tile";
		darkBoringFloorTiles[i].anchor.set(0.5);
		darkBoringFloorTiles[i].scale.x = 1.5;
		darkBoringFloorTiles[i].scale.y = 1.5;
		darkBoringFloorTiles[i].x = x * 32;
		darkBoringFloorTiles[i].y = y * 32;
		app.stage.addChild(darkBoringFloorTiles[i]);
		i++;
	}
	i++;
}


// Setup main character
var mainChar = {};
setupMainChar(); // See above

// Setup kitty kat :3
var cat = generateFromSpritesheet(0, 0, 96, 192, 3, 4, "content/characters/cat/spritesheet.png");
cat.tag = "cat";
cat.anchor.set(0.5);
cat.scale.x = 1.3;
cat.scale.y = 1.3;
cat.boundsX = 11;
cat.boundsY = 20;
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

// Setup healer character
var healer = generateFromSpritesheet(0, 0, 576, 256, 9, 4, "content/characters/healer/spritesheet.png");
healer.tag = "healer";
healer.anchor.set(0.5);
healer.scale.x = 1.3;
healer.scale.y = 1.3;
healer.boundsX = 11;
healer.boundsY = 29;
healer.x = appWidth / 1.4;
healer.y = appHeight / 4;
app.stage.addChild(healer);
healer.walking = false;
healer.direction = "down";
healer.WalkFrame = 0;
healer.handleWalk = function() {
	if (!this.walking) {
		var num = Math.floor(Math.random() * 4);
		var direction = ["up","down","left","right"][num];
		startWalk(this, direction);
		this.walkStart += 60;
		this.walkEnd += 60;
	}
}

// Enemy
var skeleton = generateFromSpritesheet(0, 0, 576, 256, 9, 4, "content/characters/skeleton/spritesheet2.png");
skeleton.tag = "skeleton";
skeleton.anchor.set(0.5);
skeleton.scale.x = 1.3;
skeleton.scale.y = 1.3;
skeleton.boundsX = 20;
skeleton.boundsY = 31;
skeleton.x = appWidth / 1.5;
skeleton.y = appHeight / 1.5;
app.stage.addChild(skeleton);
skeleton.walking = false;
skeleton.direction = "right";
skeleton.WalkFrame = 0;
skeleton.handleWalk = function() {
	if (!this.walking) {
		var num = Math.floor(Math.random() * 4);
		var direction = ["up","down","left","right"][num];
		startWalk(this, direction);
		this.walkStart += 180;
		this.walkEnd += 180;
	}
}

// Basic unit functions
var collisionChars = [mainChar, cat, skeleton, healer];
var interactables = [cat, skeleton, healer];
var walkables = [mainChar, cat, skeleton, healer];
function startWalk(character, direction) {
	if (!character.walking) {
		character.walking = true;
		character.direction = direction;
		character.walkStart = activeTimer;
		character.walkEnd = activeTimer + 30;
	}
}
var debugText = new PIXI.Text("Debug");
function displayDebugText(message) {
	debugText.destroy();
	debugText = new PIXI.Text(message);
	debugText.style.fill = 0xFFFFFF;
	debugText.anchor.set(0.5);
	debugText.x = appWidth * 0.15;
	debugText.y = appHeight * 0.1;
	app.stage.addChild(debugText);
}

// Main loop
app.ticker.add(function(delta) {
	if (running) {
		
		if (debug) {
			displayDebugText("Global Timer: " + globalTimer + "\n" +
							 "Active Timer: " + activeTimer + "\n" +
							 "Last Press: " + lastPress + "\n" +
							 "HP: " + mainChar.HP);
		}
		
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
			skeleton.handleWalk();
			healer.handleWalk();
			
			// For switching from textbox interaction (where globalTimer was used)
			if (activeTimer < lastPress) {
				lastPress = activeTimer;
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
					textBox.create(["-- PAUSED --"]);
				}
				// Z key
				if (zKey.clicked || z_key.isDown) {
					lastPress = activeTimer;
					// Handle interactions with other objects
					var interact = mainChar.checkInteraction();
					if (interact != "None") {
						lastPress = globalTimer; // Going into textbox interaction, which uses globalTimer
						if (interact == "cat") {
							textBox.create(["Meow!"])
						}
						if (interact == "skeleton") {
							textBox.create(["~~you've been spooped~~"]);
							mainChar.HP -= 10;
						}
						if (interact == "healer") {
							if (mainChar.HP < mainChar.maxHP) {
								textBox.create(["Oh hey there daughter!", "You look like you could use some healing...", "There ya go, all done!", "See you around."]);
								mainChar.HP = mainChar.maxHP;
							}
							else {
								textBox.create(["Oh hey there daughter!", "Glad to see you're doing well", "Stay safe!"]);
							}
						}
					}
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
