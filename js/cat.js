
function setupCat() {
	up = [];
	down = [];
	right = [];
	left = [];
	var texture = TextureCache["content/characters/cat/spritesheet.png"];
	for (var i = 0; i < 4; i++) {
		var rectangle = new Rectangle(0 + (i * 12), 0, 12, 8);
		texture.frame = rectangle;
		up[i] = texture;
		rectangle = new Rectangle(0 + (i * 12), 8, 12, 8);
		texture.frame = rectangle;
		right[i] = texture;
		rectangle = new Rectangle(0 + (i * 12), 16, 12, 8);
		texture.frame = rectangle;
		down[i] = texture;
		rectangle = new Rectangle(0 + (i * 12), 24, 12, 8);
		texture.frame = rectangle;
		left[i] = texture;
	}
	cat = new Sprite(up[0]);
	cat.textures = {};
	cat.textures.up = up;
	cat.textures.down = down;
	cat.textures.right = right;
	cat.textures.left = left;
	cat.anchor.set(0.5);
	cat.scale.x = 1;
	cat.scale.y = 1;
	cat.x = appWidth / 3;
	cat.y = appHeight / 4;
	app.stage.addChild(cat);
	cat.walking = false;
	cat.direction = "right";
	cat.WalkFrame = 0;
}