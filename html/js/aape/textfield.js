(function(window){

	window.aape = window.aape || {};
	window.aape.TextField = TextField;

	var prototype = TextField.prototype = Object.create( PIXI.Text.prototype );
	prototype.constructor = TextField;


	TextField.CENTER = "center";
	TextField.RIGHT = "right";
	TextField.LEFT = "left";

	function TextField(text, style, margin)
	{
		this.textStyle = style;
		this.margin = margin;

		PIXI.Text.call( this, text, style );

		this.setupText( text );
	}



	/**
	 * Getter / Setter
	 */

	Object.defineProperty( prototype, "x", 
	{
		get: function() 
		{	
			return this.position.x;
		},
		set: function(value) 
		{	
			this.position.x = value;
			
			this.changeBasePosition();
			this.positionText();
		}
	});


	/**
	 * Public interface
	 */

	Object.defineProperty( prototype, "_text", 
	{
		get: function() 
		{	
			return this.__text;
		},
		set: function(value) 
		{	
			this.__text = value;
			this.positionText();
		}
	});

	prototype.setupText = function(text)
	{
		this.text = text;
		this.setupComplete = true;

		this.changeBasePosition();
		this.positionText();
	};


	/**
	 * Private interface.
	 */

	prototype.changeBasePosition = function()
	{
		this.margin.x = this.position.x;
		this.margin.y = this.position.y;
	};


	/** Position functions. */
	prototype.positionText = function()
	{
		if( this.setupComplete )
		{
			var bounds = this.getBounds();

			switch( this.textStyle.align )
			{
				case TextField.CENTER:
					this.alignTextToCenter( bounds );
					break;

				case TextField.RIGHT:
					this.alignTextToRight( bounds );
					break;
			}
		}
	};

	prototype.alignTextToCenter = function(bounds)
	{
		var position = this.margin.x + ( this.margin.width - bounds.width ) * .5;
		this.position.x = position;
	};

	prototype.alignTextToRight = function(bounds)
	{	
		var position = this.margin.x + this.margin.width - bounds.width;
		this.position.x = position;
	};

}(window));