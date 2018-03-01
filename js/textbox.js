var textBox = {
	
	active: false,
	entries: [],
	currentPlace: 0,
	textObject: {destroy: function(){}},
	
	display: function() {
		this.textObject.destroy();
		this.textObject = new PIXI.Text(this.entries[this.currentPlace]);
		this.textObject.anchor.set(0.5);
		this.textObject.x = appWidth / 2;
		this.textObject.y = appHeight * 0.8;
		app.stage.addChild(this.textObject);
	},
	
	create: function(newEntries){
		this.active = true;
		this.entries = newEntries;
		this.currentPlace = 0;
		this.display();
	},
	
	advance: function() {
		this.currentPlace++;
		if (this.currentPlace > this.entries.length - 1) {
			this.end();
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
		this.entries = [];
		this.currentPlace = 0; 
	}
};