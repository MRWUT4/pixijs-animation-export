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
		PIXI.Text.call( this, text, style );

		this.textStyle = style;
		this.margin = margin;

		this.positionText();
	}



	/**
	 * Public interface
	 */

	Object.defineProperty( prototype, "id", 
	{
		get: function() 
		{	
			return this._id;
		},
		set: function(value) 
		{	
			this._id = value;
			this.positionText();
		}
	});

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


	/**
	 * Private interface.
	 */

	/** Position functions. */
	prototype.positionText = function()
	{
		if( this.textStyle )
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