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
		this.style = style;
		this.margin = margin;

		PIXI.Text.call( this, text, style );

		this.setText( text );
	}


	/**
	 * Override functions.
	 */

	prototype.setTextText = prototype.setText;
	prototype.setText = function(string)
	{
		string = this.modifyStringToFitLineWidth( string );
		this.text = string;

		this.positionText();
	};

	Object.defineProperty( prototype, "_text", 
	{
		get: function() 
		{	
			return this.__text;
		},
		set: function(value) 
		{	
			this.__text = value;

			if( this.position && this.style )
				this.positionText();
		}
	});


	/**
	 * Getter / Setter
	 */

	Object.defineProperty( prototype, "property", 
	{
		get: function() 
		{	
			return this._property;
		},
		set: function(value) 
		{	
			this._property = value;
		}
	});

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

	Object.defineProperty( prototype, "margin", 
	{
		get: function() 
		{	
			return this._margin;
		},
		set: function(value) 
		{	
			this._margin = value;
		}
	});

	Object.defineProperty( prototype, "lineWidth", 
	{
		get: function() 
		{	
			return this._lineWidth;
		},
		set: function(value) 
		{	
			this._lineWidth = value;
		}
	});

	Object.defineProperty( prototype, "isUnderLineWidth", 
	{
		get: function() 
		{	
			return this.getBounds().width < this.lineWidth || !this.lineWidth;
		}
	});


	/**
	 * Private interface.
	 */


	/** Position functions. */
	prototype.positionText = function()
	{
		if( this.margin )
		{
			switch( this.style.align )
			{
				case TextField.CENTER:
					this.alignTextToCenter();
					break;

				case TextField.RIGHT:
					this.alignTextToRight();
					break;
			}
		}
	};

	prototype.changeBasePosition = function()
	{
		if( this.margin.x === undefined )
		{
			this.margin.x = this.position.x;
			this.margin.y = this.position.y;
		}
	};

	prototype.alignTextToCenter = function()
	{
		var position = this.margin.x + ( this.margin.width - this.width ) * .5;
		this.position.x = position;
	};

	prototype.alignTextToRight = function()
	{
		var position = ( this.margin.x + this.margin.width - this.width );
		this.position.x = position;
	};


	/** Line width handling. */
	prototype.modifyStringToFitLineWidth = function(string)
	{
		if( !this.isUnderLineWidth && this.multiline )
		{
			var split = string.split( " " );
			split.splice( split.length - 2, 0, "\n" );
			string = split.join( " " );
		}
		else
		if( !this.isUnderLineWidth )
		{
			if( string.length >= this.text.length )
				string = this.text;
		}

		return string;
	};

}(window));