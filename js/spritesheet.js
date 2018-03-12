
function generateFromSpritesheet(width, height, divX, divY, pathname, character) {
	up = [];
	down = [];
	right = [];
	left = [];
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
	character = new PIXI.Sprite(right[0]);
	character.textures = {};
	character.textures.up = up;
	character.textures.down = down;
	character.textures.right = right;
	character.textures.left = left;
}
