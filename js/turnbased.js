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