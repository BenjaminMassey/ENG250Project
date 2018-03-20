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
function setupMainChar(spawnX, spawnY, startHP) {	
	mainChar = PIXI.Sprite.fromImage('content/characters/main/Right0.png');
	mainChar.tag = "main";
	mainChar.maxHP = startHP;
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
	mainChar.boundsY = 28;
	mainChar.x = spawnX;
	mainChar.y = spawnY;
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
		checker.tag = "checker";
		checker.x = this.x + amount.x;
		checker.y = this.y + amount.y;
		checker.boundsX = 25;
		checker.boundsY = 35;
		app.stage.addChild(checker);
		// See if the checker hits anything
		var interact = {tag: "None"};
		for (var i = 0; i < interactables.length; i++) {
			if (hitTestRectangle(interactables[i], checker)) {
				interact = interactables[i];
			}
		}
		checker.destroy();
		return interact;
	}
	mainChar.kill = false;
	mainChar.murder = function() {
		var indexI = interactables.indexOf(mainChar.target);
		interactables.splice(indexI, 1);
		//var indexW = interactables.indexOf(mainChar.target);
		//walkables.splice(indexW, 1);
		var indexC = collisionChars.indexOf(mainChar.target);
		collisionChars.splice(indexC, 1);
		mainChar.target.tag = "dead";
		mainChar.target.destroy();
		mainChar.kill = false;
	};
	mainChar.zap = function() {
		var damageTaken = mainChar.target.attack();
		var rng = Math.floor(Math.random() * 10);
		if (rng > 2) {
			var damage = 8 + Math.floor(Math.random() * 5);
			mainChar.target.HP -= damage;
			if (mainChar.target.HP > 0) {
				textBox.create(["You hit for " + damage + " HP!", "Enemy now has " + mainChar.target.HP + " health left.", "The enemy hit you back for " + damageTaken + " damage!", "You now have " + mainChar.HP + " HP left."], function(){mainChar.fight();});
			}
			else {
				mainChar.HP += damageTaken;
				textBox.create(["You won!"], function(){mainChar.kill = true;});
			}
		}
		else {
			textBox.create(["You missed your zap!", "The enemy hit you back for " + damageTaken + " damage!", "You now have " + mainChar.HP + " HP left."], function(){mainChar.fight();});
		}
	}
	mainChar.punch = function() {
		var damageTaken = mainChar.target.attack();
		var damage = 5 + Math.floor(Math.random() * 3);
		mainChar.target.HP -= damage;
		if (mainChar.target.HP > 0) {
			textBox.create(["You hit for " + damage + " HP!", "Enemy now has " + mainChar.target.HP + " health left.", "The enemy hit you back for " + damageTaken + " damage!", "You now have " + mainChar.HP + " HP left."], function(){mainChar.fight();});
		}
		else {
			mainChar.HP += damageTaken;
			textBox.create(["You won!"], function(){mainChar.kill = true;});
		}
	}
	mainChar.fight = function() {
		turnBased.create(["ZAP", "Punch"], [function(){mainChar.zap();}, function(){mainChar.punch();}]);
	}
}

var turnBased = {
	
	active: false,
	options: [],
	functions: [],
	currentSelection: 0,
	textObject: {destroy: function(){}},
	
	create: function(newOptions, newFunctions){
		this.active = true;
		this.options = newOptions;
		this.functions = newFunctions;
		this.currentSelection = 0;
		this.display();
	},
	
	display: function() {
		this.textObject.destroy();
		var txt = "";
		for (var i = 0; i < this.options.length; i++) {
			if (this.currentSelection == i) {
				txt += "[" + this.options[i] + "]";
			}
			else {
				txt += this.options[i];
			}
			txt += "\n";
		}
		this.textObject = new PIXI.Text(txt);
		this.textObject.anchor.set(0.5);
		this.textObject.style.fill = 0xFFFFFF;
		this.textObject.x = appWidth / 2;
		this.textObject.y = appHeight * 0.8;
		app.stage.addChild(this.textObject);
	},
	
	perform: function() {
		this.functions[this.currentSelection]();
		this.end();
	},
	
	advance: function() {
		this.currentSelection++;
		if (this.currentSelection > this.options.length - 1) {
			this.currentSelection--;
		}
		else {
			this.display();
		}
	},
	
	devance: function() {
		this.currentSelection--;
		if (this.currentSelection < 0) {
			this.currentSelection++;
		}
		else {
			this.display();
		}
	},
	
	end: function() {
		this.active = false;
		this.textObject.destroy();
		this.textObject = {destroy: function(){}};
		// Following shouldn't matter because start but why not?
		this.options = [];
		this.currentSelection = 0; 
	}
};

// END OF GROSS ALL FUNCTIONS IN HERE BS

// Setup keys (see keyboard.js and https://help.adobe.com/en_US/AS2LCR/Flash_10.0/help.html?content=00000520.html)
var left_key = keyboard(37);	var up_key = keyboard(38);
var right_key = keyboard(39);	var down_key = keyboard(40);
var x_key = keyboard(88);		var z_key = keyboard(90);

/* CREATE THE BASIC BORING BACKGROUND

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

*/

/* SET UP MAIN CHAR AND SPAWN HER IN CENTER

// Setup main character
var mainChar = {};
setupMainChar(appWidth / 2, appHeight / 2, 50); // See above

*/

// Setup kitty kat :3
function getCat(spawnX, spawnY) {
	var cat = generateFromSpritesheet(0, 0, 96, 192, 3, 4, "content/characters/cat/spritesheet.png");
	cat.tag = "cat";
	cat.anchor.set(0.5);
	cat.scale.x = 1.3;
	cat.scale.y = 1.3;
	cat.boundsX = 11;
	cat.boundsY = 20;
	cat.x = spawnX;
	cat.y = spawnY;
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
	return cat;
}

/* CREATE CAT AND PUT IN TOP LEFT ISH

var cat = getCat(appWidth / 3, appHeight / 4);

*/

// Setup healer character
function getHealer(spawnX, spawnY) {
	var healer = generateFromSpritesheet(0, 0, 576, 256, 9, 4, "content/characters/healer/spritesheet.png");
	healer.tag = "healer";
	healer.anchor.set(0.5);
	healer.scale.x = 1.3;
	healer.scale.y = 1.3;
	healer.boundsX = 11;
	healer.boundsY = 29;
	healer.x = spawnX;
	healer.y = spawnY;
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
	return healer;
}
/* CREATE HEALER AND PUT HIM IN TOP RIGHT ISH

var healer = getHealer(appWidth / 1.4, appHeight / 4);

*/

// Enemy
function getSkeleton(spawnX, spawnY, startHP, baseDMG) {
	var skeleton = generateFromSpritesheet(0, 0, 576, 256, 9, 4, "content/characters/skeleton/spritesheet2.png");
	skeleton.tag = "skeleton";
	skeleton.anchor.set(0.5);
	skeleton.scale.x = 1.3;
	skeleton.scale.y = 1.3;
	skeleton.boundsX = 20;
	skeleton.boundsY = 30;
	skeleton.x = spawnX;
	skeleton.y = spawnY;
	skeleton.HP = startHP;
	skeleton.baseDMG = baseDMG;
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
	skeleton.attack = function() {
		console.log("skeleattack");
		var damage = this.baseDMG + Math.floor(Math.random() * 3);
		mainChar.HP -= damage;
		return damage;
	}
	return skeleton;
}

/* CREATE SKELEBOY AND PUT HIM TO RIGHT OF PLAYER

var skeleton = getSkeleton(mainChar.x + 50, mainChar.y, 25, 5);

*/

/* DEFINE THE BASIC LISTS FOR SORTING

// Basic unit functions

var collisionChars = [mainChar, cat, skeleton, healer];
var interactables = [cat, skeleton, healer];
var walkables = [mainChar, cat, skeleton, healer];

*/
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

var mainChar = {};
var walkables = [];
var collisionChars = [];
var interactables = [];

function clearScreen() {
	// http://www.html5gamedevs.com/topic/840-remove-all-children-from-a-stage/?do=findComment&comment=4707
	for (var i = app.stage.children.length - 1; i >= 0; i--) {	
		app.stage.removeChild(app.stage.children[i]);
	}
	walkables = [];
	collisionChars = [];
	interactables = [];
}

// Create the lame house and set everything up
function makeLameHouse() {
	clearScreen();
	// Set up the background
	var baseTiles = generateFromTilesheet(0, 0, 1024, 1024, 32, 32, "content/environment/main/base_out_atlas.png")
	var darkBoringFloorTiles = [];
	var i = 0; // Works out to be 26x21
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
	// Put in main char
	setupMainChar(appWidth / 2, appHeight / 2, 50);
	// Put in healer
	var healer = getHealer(appWidth / 1.4, appHeight / 4);
	// Put in cat
	var cat = getCat(appWidth / 3, appHeight / 4);
	// Setup lists
	collisionChars = [mainChar, cat, healer];
	interactables = [cat, healer];
	walkables = [mainChar, cat, healer];
}

makeLameHouse();

// Main loop
app.ticker.add(function(delta) {
	if (running) {
		
		if (debug) {/*
			displayDebugText("Global Timer: " + globalTimer + "\n" +
							 "Active Timer: " + activeTimer + "\n" +
							 "Last Press: " + lastPress + "\n" +
							 "HP: " + mainChar.HP);*/
		}
		
		if((globalTimer % 60) == 0) { // Every second
			var walkers = "Walkers: ";
			for (var i = 0; i < walkables.length; i++) {
				if (i < walkables.length - 1) {
					walkers += walkables[i].tag + ", ";
				}
				else {
					walkers += walkables[i].tag;
				}
			}
			console.log(walkers);
		}

		if (textBox.active) {
			// Z key
			if ((zKey.clicked || z_key.isDown) && globalTimer > lastPress + 15) {
				lastPress = globalTimer;
				textBox.advance();
			}
		}
		else if (turnBased.active) {
			if ((upKey.clicked || up_key.isDown) && globalTimer > lastPress + 15) {
				lastPress = globalTimer;
				turnBased.devance();
			}
			if ((downKey.clicked || down_key.isDown) && globalTimer > lastPress + 15) {
				lastPress = globalTimer;
				turnBased.advance();
			}
			if ((zKey.clicked || z_key.isDown) && globalTimer > lastPress + 15) {
				lastPress = globalTimer;
				turnBased.perform();
			}
		}
		else {
			// NPC idles
			for (var i = 0; i < walkables.length; i++) {
				if (walkables[i].tag != "main") {
					walkables[i].handleWalk();
				}
			}
			
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
					textBox.create(["-- PAUSED --"], function(){});
				}
				// Z key
				if (zKey.clicked || z_key.isDown) {
					lastPress = activeTimer;
					// Handle interactions with other objects
					var interact = mainChar.checkInteraction();
					if (interact.tag != "None") {
						lastPress = globalTimer; // Going into textbox interaction, which uses globalTimer
						if (interact.tag == "cat") {
							textBox.create(["Meow!"], function(){})
						}
						if (interact.tag == "skeleton") {
							mainChar.target = interact;
							textBox.create(["You found a skeleton! He has " + interact.HP + " health."], function(){mainChar.fight();});
						}
						if (interact.tag == "healer") {
							if (mainChar.HP < mainChar.maxHP) {
								textBox.create(["Oh hey there daughter!", "You look like you could use some healing...", "There ya go, all done!", "See you around.", "(You are now back to " + mainChar.maxHP + " health.)"], function(){mainChar.HP=mainChar.maxHP;});
							}
							else {
								textBox.create(["Oh hey there daughter!", "Glad to see you're doing well.", "Stay safe!"], function(){});
							}
						}
					}
				}
			}
			// Handle walking
			for (var i = 0; i < walkables.length; i++) {
				if (walkables[i] != null && walkables[i].tag != "dead") {
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
			}
			// Simple timer for active frames
			activeTimer++;
			
		}
		
		// Unclick (mobile vitual) keys for next frame - may be irrelevant
		var keys = [upKey, downKey, rightKey, leftKey, xKey, zKey];
		for (var i = 0; i < keys.length; i++) {
			keys[i].clicked = false;
		}
		
		if (mainChar.kill) {
			mainChar.murder();
		}
		
		// Simple global timer of frame count
		globalTimer++;
	}
});
