(function(window){

	window.pixijs = window.pixijs || {};
	window.pixijs.Timeline = Timeline;

	var prototype = Timeline.prototype = Object.create( PIXI.Container.prototype );
	prototype.constructor = Timeline;


	Timeline.TIMELINE = "timeline";
	Timeline.MOVIECLIP = "movieclip";
	Timeline.SPRITE = "sprite";
	Timeline.TEXTFIELD = "textfield";


	function Timeline(setup)
	{
		PIXI.Container.call( this );

		this.library = setup.library;
		this.elements = setup.elements;
		this.id = setup.id || "root";

		this.setFrame( 0 );

		/*
		var graphics = new PIXI.Graphics();

		graphics.beginFill( "#000" );
		graphics.drawRect( 0, 0, 10, 10 );

		this.addChild( graphics );
		/*/
	}


	/**
	 * Getter / Setter
	 */

	// Object.defineProperty( prototype, "template", 
	// {
	// 	get: function() 
	// 	{	
	// 		// this._template = this._template !== undefined ? this._template : null;
	// 	}
	// });

	prototype.getTemplate = function(id)
	{
		return this.library[ id ];
	};


	/**
	 * Public interface.
	 */

	prototype.parse = function(id)
	{
		var object = null;
		var template = this.getTemplate( id );

		switch( template.type )
		{
			case Timeline.TIMELINE:
				object = this.getTimeline( id );
				break;

			case Timeline.MOVIECLIP:
				object = this.getMovieClip( id, template, this.elements );
				break;

			case Timeline.SPRITE:
				object = this.getSprite( id, template );
				break;

			case Timeline.TEXTFIELD:
				object = this.getTextField( id, template );
				break;
		}

		return object;
	};


	/** Timeline functions. */
	prototype.getTimeline = function(id)
	{
		// timeline creates its own DisplayObjects to simplify object constuction.
		var timeline = new pixijs.Timeline(
		{
			library: this.library,
			elements: this.elements,
			id: id
		});		
	};

	prototype.setFrame = function(index)
	{
		this.index = index;

		var template = this.getTemplate( this.id );
		var layers = template.layers;

		this.resolveLayers( layers, index );
	};

	prototype.resolveLayers = function(layers, index)
	{
		layers.map( function( layer )
		{
			this.resolveFrames( layer.frames, index );

		}.bind(this) );
	};

	prototype.resolveFrames = function(frames, index)
	{
		var frame = this.resolveKeyFrame( frames, index );
		var elements = frame.elements;

		elements.map( function( element )
		{
			var displayObject = this.parse( element.id );
			this.addToDisplayList( displayObject );

		}.bind(this) )
	};

	prototype.resolveKeyFrame = function(object, index)
	{
		var previous = null;

		for( var property in object )
		{
			var value = object[ property ];

			if( Number( property ) >= index )
				return previous || value;

			previous = value;
		}
	};

	prototype.addToDisplayList = function(displayObject)
	{
		if( displayObject )
		{
			this.addChild( displayObject );
		}
	};



	/** MovieClip functions. */
	prototype.getMovieClip = function(id, template, elements)
	{
		var json = this.getAtlasJSONWithID( elements, id );
		var textures = this.getTextures( elements, json, id );

		var movieClip = new pixijs.MovieClip( textures/*, animations, comments*/ );

		return movieClip;
	};

	prototype.getFrames = function(frames, id)
	{
		var list = Parse( frames ).filter( this.nameIsID( id ).bind(this) );
		return list;
	};

	prototype.getTextures = function(elements, json, id)
	{
		var frames = this.getFrames( json.frames, id );
		var baseTexture = this.getBaseTexture( elements, json.meta.image );

		var list = frames.map( function(item)
		{
			var frame = item.frame;
			var size = item.spriteSourceSize;

			var rectangle = new PIXI.Rectangle( frame.x, frame.y, frame.w, frame.h );
			var trim = new PIXI.Rectangle( size.x, size.y, size.w, size.h );

			var texture = new PIXI.Texture( baseTexture, rectangle );
			texture.trim = trim;

			return texture;
		});

		return list;
	};

	prototype.getBaseTexture = function(elements, image)
	{
		var source = elements.find( function(element)
		{
			var isImage = element instanceof Image;

			if( isImage )
			{
				var path = element.src.split( "/" ).slice( -1 )[ 0 ];
				var hasURL = path == image;

				return hasURL;
			}
		});

		var baseTexture = new PIXI.BaseTexture( source );

		return baseTexture;
	};



	prototype.getAtlasJSONWithID = function(elements, id)
	{
		var json = elements.find( function(element)
		{
			if( this.getIsValidAtlas( element ) )
			{
				var frames = element.frames;
				var hasID = Parse( frames ).every( this.nameIsID( id ).bind(this) );

				return hasID;
			}
			else
				return false;

		}.bind(this) );

		return json;
	};

	prototype.getFrameIDWithoutIndex = function(id)
	{
		return id.slice( 0, -4 );
	};


	prototype.nameIsID = function(id)
	{
		return function( property, value )
		{
			var name = this.getFrameIDWithoutIndex( property );
			return name == id;
		};
	};


	/** Sprite functions. */
	prototype.getSprite = function()
	{
		
	};


	/** TextFieled functions. */
	prototype.getTextField = function()
	{
		
	};


	/** Assist. */
	prototype.getIsValidAtlas = function(element)
	{
		return element.frames && element.meta;
	};

}(window));