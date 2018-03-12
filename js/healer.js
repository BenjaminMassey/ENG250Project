// TO DO THIS IS NOT ACTUALLY DONE AT ALL
function setupHealer() {
	// Setup healing character
	healer = PIXI.Sprite.fromImage('content/characters/healer/down0');
	healer.textures = {};
	healer.textures.up = [];
	healer.textures.down = [];
	healer.textures.right = [];
	healer.textures.left = [];
	for (var i = 0; i < 9; i++){
		healer.textures.up[i] = PIXI.Texture.fromImage("/content/characters/healer/up" + i + ".png");
		healer.textures.down[i] = PIXI.Texture.fromImage("/content/characters/healer/down" + i + ".png");
		healer.textures.right[i] = PIXI.Texture.fromImage("/content/characters/healer/right" + i + ".png");
		healer.textures.left[i] = PIXI.Texture.fromImage("/content/characters/healer/left" + i + ".png");
	}
	healer.anchor.set(0.5); // Center anchor
	healer.scale.x = 1;		healer.scale.y = 1; // Set size
	healer.x = appWidth / 1.7;	healer.y = appHeight / 1.3; // Semi-random positioning
	app.stage.addChild(healer); // Add to app panel
	healer.direction = "right"; // What direction facing
}