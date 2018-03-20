// Setup app
var debug = true;
var appWidth = 800;
var appHeight = 650;
var app = new PIXI.Application(appWidth, appHeight, {backgroundColor : 0x1099bb});
document.body.appendChild(app.view);
var globalTimer = 0; // Updated by 1 every frame (runs at 60 fps)
var activeTimer = 0; // Updated same as global - but only while active (not textbox)
var houseTimer = 0; // Whole point of this project
var running = true;
var lastPress = 0; // Last frame a key was pressed
var firstTime = true; // For spawning main char
var health = 50; // Need to store globaly because bad code
var killCount = 0;

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
function setupMainChar(spawnX, spawnY, maxHP, currentHP) {
	if (firstTime) {
		mainChar = PIXI.Sprite.fromImage('content/characters/main/Down0.png');
		mainChar.direction = "down"; // What direction facing
	}
	else {
		if (loc == "inside") {
			mainChar = PIXI.Sprite.fromImage('content/characters/main/Up0.png');
			mainChar.direction = "up"; // What direction facing
		}
		else {
			mainChar = PIXI.Sprite.fromImage('content/characters/main/Down0.png');
			mainChar.direction = "down"; // What direction facing
		}
	}
	mainChar.tag = "main";
	mainChar.maxHP = maxHP;
	mainChar.HP = currentHP;
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
		killCount++;
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
		this.textObject.style.align = "center";
		this.textObject.style.strokeThickness = 3;
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

// Setup keys (see keyboard.js and https://help.adobe.com/en_US/AS2LCR/Flash_10.0/help.html?content=00000520.html)
var left_key = keyboard(37);	var up_key = keyboard(38);
var right_key = keyboard(39);	var down_key = keyboard(40);
var x_key = keyboard(88);		var z_key = keyboard(90);


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
			var num2 = Math.floor(Math.random() * 60);
			this.walkStart += 35 + num2;
			this.walkEnd += 35 + num2;
		}
	}
	return cat;
}

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
			var num2 = Math.floor(Math.random() * 35);
			this.walkStart += 40 + num2;
			this.walkEnd += 40 + num2;
		}
	}
	return healer;
}

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
			var num2 = Math.floor(Math.random() * 50);
			this.walkStart += 150 + num2;
			this.walkEnd += 150 + num2;
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
	debugText.style.strokeThickness = 3;
	debugText.anchor.set(0.5);
	debugText.x = appWidth * 0.15;
	debugText.y = appHeight * 0.15;
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

// Create the bad house and set everything up
function makeBadHouse() {
	// Set up the background
	var baseTiles = generateFromTilesheet(0, 0, 1024, 1024, 32, 32, "content/environment/main/base_out_atlas.png")
	
	// Works out to be 26x21
	// Floor tiles
	for (var x = 5; x < 21; x++) {
		for (var y = 5; y < 16; y++) {
			var tile = new PIXI.Sprite(baseTiles[179]);
			tile.tag = "floorTile";
			tile.anchor.set(0.5);
			tile.scale.x = 1.5;
			tile.scale.y = 1.5;
			tile.x = x * 32;
			tile.y = y * 32;
			app.stage.addChild(tile);
		}
	}
	// Left and right walls
	for (var i = 0; i < 2; i++) {
		var x = 0;
		if (i == 0) {
			x = 4 * 32;
		}
		else {
			x = 21 * 32;
		}
		//console.log(x);
		for (var y = 5; y < 16; y++) {
			var tile = new PIXI.Sprite(baseTiles[636]);
			tile.tag = "wallTile";
			tile.anchor.set(0.5);
			tile.scale.x = 1.5;
			tile.scale.y = 1.5;
			tile.x = x;
			tile.y = y * 32;
			tile.boundsX = 18;
			tile.boundsY = 18;
			app.stage.addChild(tile);
			collisionChars[collisionChars.length] = tile;
		}
	}
	// Top and bottom walls
	for (var i = 0; i < 2; i++) {
		var y = 0;
		if (i == 0) {
			y = 4 * 32;
		}
		else {
			y = 16 * 32;
		}
		//console.log(x);
		for (var x = 4; x < 22; x++) {
			var tile;
			if (!(i == 1 && tile.x > ((appWidth / 2) - 20) && tile.x < ((appWidth / 2) + 20))) {
				tile = new PIXI.Sprite(baseTiles[636]);
				tile.tag = "wallTile";
			}
			else {
				tile = new PIXI.Sprite(baseTiles[108]);
				tile.tag = "doorTile";
				interactables[interactables.length] = tile;
			}
			tile.anchor.set(0.5);
			tile.scale.x = 1.5;
			tile.scale.y = 1.5;
			tile.x = x * 32;
			tile.y = y;
			tile.boundsX = 18;
			tile.boundsY = 18;
			app.stage.addChild(tile);
			collisionChars[collisionChars.length] = tile;
		}
	}
	// Put in main char
	if(firstTime) {
		setupMainChar(appWidth / 2, appHeight / 2, 50, 50);
		firstTime = false;
	}
	else {
		setupMainChar(430, 450, 50, health);
	}
	collisionChars[collisionChars.length] = mainChar;
	walkables[walkables.length] = mainChar;
	// Put in healer
	var healer = getHealer(appWidth / 1.5, appHeight / 2.5);
	collisionChars[collisionChars.length] = healer;
	walkables[walkables.length] = healer;
	interactables[interactables.length] = healer;
}
// Create the good house and set everything up
function makeGoodHouse() {
	// Set up the background
	var baseTiles = generateFromTilesheet(0, 0, 1024, 1024, 32, 32, "content/environment/main/base_out_atlas.png")
	
	// Works out to be 26x21
	// Floor tiles
	for (var x = 5; x < 21; x++) {
		for (var y = 5; y < 16; y++) {
			var tile = new PIXI.Sprite(baseTiles[179]);
			tile.tag = "floorTile";
			tile.anchor.set(0.5);
			tile.scale.x = 1.5;
			tile.scale.y = 1.5;
			tile.x = x * 32;
			tile.y = y * 32;
			app.stage.addChild(tile);
		}
	}
	// Left and right walls
	for (var i = 0; i < 2; i++) {
		var x = 0;
		if (i == 0) {
			x = 4 * 32;
		}
		else {
			x = 21 * 32;
		}
		console.log(x);
		for (var y = 5; y < 16; y++) {
			var tile = new PIXI.Sprite(baseTiles[636]);
			tile.tag = "wallTile";
			tile.anchor.set(0.5);
			tile.scale.x = 1.5;
			tile.scale.y = 1.5;
			tile.x = x;
			tile.y = y * 32;
			tile.boundsX = 18;
			tile.boundsY = 18;
			app.stage.addChild(tile);
			collisionChars[collisionChars.length] = tile;
		}
	}
	// Top and bottom walls
	for (var i = 0; i < 2; i++) {
		var y = 0;
		if (i == 0) {
			y = 4 * 32;
		}
		else {
			y = 16 * 32;
		}
		console.log(x);
		for (var x = 4; x < 22; x++) {
			var tile;
			if (!(i == 1 && tile.x > ((appWidth / 2) - 20) && tile.x < ((appWidth / 2) + 20))) {
				tile = new PIXI.Sprite(baseTiles[636]);
				tile.tag = "wallTile";
			}
			else {
				tile = new PIXI.Sprite(baseTiles[108]);
				tile.tag = "doorTile";
				interactables[interactables.length] = tile;
			}
			tile.anchor.set(0.5);
			tile.scale.x = 1.5;
			tile.scale.y = 1.5;
			tile.x = x * 32;
			tile.y = y;
			tile.boundsX = 18;
			tile.boundsY = 18;
			app.stage.addChild(tile);
			collisionChars[collisionChars.length] = tile;
		}
	}
	// Put in main char
	if(firstTime) {
		setupMainChar(appWidth / 2, appHeight / 2, 50, 50);
		firstTime = false;
	}
	else {
		setupMainChar(430, 450, 50, health);
	}
	collisionChars[collisionChars.length] = mainChar;
	walkables[walkables.length] = mainChar;
	// Put in healer
	var healer = getHealer(appWidth / 1.5, appHeight / 2.5);
	collisionChars[collisionChars.length] = healer;
	walkables[walkables.length] = healer;
	interactables[interactables.length] = healer;
	// Put in cat
	var cat = getCat(appWidth / 3, appHeight / 3.5);
	collisionChars[collisionChars.length] = cat;
	walkables[walkables.length] = cat;
	interactables[interactables.length] = cat;
}
// Make the outside area
function makeOutside() {
	// Set up the background
	var baseTiles = generateFromTilesheet(0, 0, 1024, 1024, 32, 32, "content/environment/main/base_out_atlas.png")
	
	// Works out to be 26x21
	// Floor tiles
	for (var x = 0; x < 26; x++) {
		for (var y = 0; y < 21; y++) {
			var tile = new PIXI.Sprite(baseTiles[764]); // 741 was top grass //766//764//760//757
			tile.tag = "floorTile";
			tile.anchor.set(0.5);
			tile.scale.x = 1.5;
			tile.scale.y = 1.5;
			tile.x = x * 32;
			tile.y = y * 32;
			app.stage.addChild(tile);
		}
	}
	// House tiles
	for (var x = 0; x < 9; x++) {
		for (var y = 0; y < 9; y++) {
			var tile;
			if (!(y == 8 && (x == 4 || x == 5))) {
				tile = new PIXI.Sprite(baseTiles[179]);
				tile.tag = "houseTile";
			}
			else {
				tile = new PIXI.Sprite(baseTiles[108]);
				tile.tag = "doorTile";
				interactables[interactables.length] = tile;
			}
			tile.anchor.set(0.5);
			tile.scale.x = 1.5;
			tile.scale.y = 1.5;
			tile.x = x * 32;
			tile.y = y * 32;
			tile.boundsX = 18;
			tile.boundsY = 18;
			app.stage.addChild(tile);
			collisionChars[collisionChars.length] = tile;
		}
	}
	// Put in main char
	setupMainChar(140, 310, 50, health);
	collisionChars[collisionChars.length] = mainChar;
	walkables[walkables.length] = mainChar;
	// Put in skeletons
	for (var i = 0; i < 7; i++) {
		var x = 300 + Math.floor(Math.random() * 400);
		var y = 20 + (90 * i);
		var HP = 15 + Math.floor(Math.random() * 30);
		var baseDMG = 2 + Math.floor(Math.random() * 8);
		var skeleton = getSkeleton(x, y, HP, baseDMG);
		collisionChars[collisionChars.length] = skeleton;
		walkables[walkables.length] = skeleton;
		interactables[interactables.length] = skeleton;
	}
}


var loc = "inside"; // as opposed to outside
var houseType;
if (Math.random() > 0.5) {
	houseType = "bad";
}
else {
	houseType = "good";
}
if (houseType == "bad") {
	makeBadHouse();
}
else {
	makeGoodHouse();
}

// Main loop
app.ticker.add(function(delta) {
	if (running) {
		
		if (loc == "outside") {
			displayDebugText("Kill Count: " + killCount + " / 5");
		}
		
		if (debug) {
			displayDebugText("Global Timer: " + globalTimer + "\n" +
							 "Active Timer: " + activeTimer + "\n" +
							 "House Timer: " + houseTimer + "\n" +
							 "Last Press: " + lastPress + "\n" +
							 "Kill count: " + killCount);
		}
		
		if (killCount == 5) {
			clearScreen();
			var yay = new PIXI.Text("You won!\n\nClick any of this text to be \ntaken to the paper about this\ngame. I hope it was bearable!");
			yay.style.fill = 0xFFFFFF;
			yay.style.strokeThickness = 3;
			yay.style.align = "center";
			yay.anchor.set(0.5);
			yay.x = (appWidth / 2);
			yay.y = (appHeight / 2);
			app.stage.addChild(yay);
			yay.interactive = true;
			yay.click = function() {
				window.open("http://eng250paper.benjaminmassey.com/");
			};
			running = false;
		}
		
		if (mainChar.HP <= 0) {
			clearScreen();
			var rip = new PIXI.Text("You died. Refresh to try again.");
			rip.style.fill = 0xFFFFFF;
			rip.style.strokeThickness = 3;
			rip.anchor.set(0.5);
			rip.x = appWidth / 2;
			rip.y = appHeight / 2;
			app.stage.addChild(rip);
			running = false;
		}
		
		if((globalTimer % 60) == 0) { // Every second
			/*
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
			var collisions = "CollisionChars: ";
			for (var i = 0; i < collisionChars.length; i++) {
				if (i < collisionChars.length - 1) {
					collisions += collisionChars[i].tag + ", ";
				}
				else {
					collisions += collisionChars[i].tag;
				}
			}
			console.log(collisions);
			*/
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
								if (houseType == "good") {
									textBox.create(["Oh hey there daughter!", "You look like you could use some healing...", "There ya go, all done!", "See you around.", "(You are now back to " + mainChar.maxHP + " health.)"], function(){mainChar.HP=mainChar.maxHP;});
								}
								else {
									textBox.create(["I'm here to heal.", "You are now back to " + mainChar.maxHP + " health."], function(){mainChar.HP=mainChar.maxHP;});
								}
							}
							else {
								if (houseType == "good") {
									textBox.create(["Oh hey there daughter!", "Glad to see you're doing well.", "Stay safe!"], function(){});
								}
								else {
									textBox.create(["I'm here to heal.", "You do not need to be healed."], function(){});
								}
							}
						}
						if (interact.tag == "doorTile") {
							health = mainChar.HP;
							clearScreen();
							if (loc == "outside") {
								loc = "inside";
								if (houseType == "good") {
									makeGoodHouse();
								}
								else {
									makeBadHouse();
								}
							}
							else {
								loc = "outside";
								makeOutside();
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
		if (loc == "inside") {
			houseTimer++;
		}
	}
});
