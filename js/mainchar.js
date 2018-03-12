
function setupMainChar() {	
	mainChar = PIXI.Sprite.fromImage('content/characters/main/Right0.png');
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