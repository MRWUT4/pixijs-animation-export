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
			this.positionText();
			// this.cuePositionUpdate = true;
		}
	});

	Object.defineProperty( prototype, "id", 
	{
		get: function() 
		{	
			return this._id;
		},
		set: function(value) 
		{	
			if( this._id !== value )
			{
				this._id = value;
				this.positionText();
				// this.cuePositionUpdate = true;
			}
		}
	});

	// Object.defineProperty( prototype, "position", 
	// {
	// 	get: function() 
	// 	{	
	// 		// this._position = this._position !== undefined ? this._position : null;
	// 		return this.transform.position;;
	// 	}
	// });


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
			// this.cuePositionUpdate = true;
		}
	});

	prototype.setupText = function(text)
	{
		this.text = text;
		this.setupComplete = true;

		this.positionText();
		// this.cuePositionUpdate = true;
	};


	// prototype.updateTransformText = prototype.updateTransform;
	// prototype.updateTransform = function()
	// {
	// 	this.updateTransformText();
	// 	// this.updateTextPosition();
	// 	this.positionText();
	// 	// this.updatePlayback();
	// };


	// prototype.updateTextPosition = function()
	// {
	// 	if( this.cuePositionUpdate === true )
	// 	{
	// 		this.cuePositionUpdate = false;
	// 		this.positionText();
	// 	}
	// };


	/**
	 * Private interface.
	 */

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

				default:
					this.alignTextToLeft( bounds );
					break;
			}
		}
	};

	prototype.alignTextToCenter = function(bounds)
	{
		var x = this.margin.x + ( this.margin.width - bounds.width ) * .5;
		this.position.x = x;
	};

	prototype.alignTextToRight = function(bounds)
	{	
		var x = this.margin.x + this.margin.width - bounds.width;
		this.position.x = x;
	};

	prototype.alignTextToLeft = function(bounds)
	{
		this.position.x = this.margin.x;
	};

}(window));