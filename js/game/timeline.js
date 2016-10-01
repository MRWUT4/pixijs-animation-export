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
	}


	/**
	 * Getter / Setter
	 */

	Object.defineProperty( prototype, "layers", 
	{
		get: function() 
		{	
			this._layers = this._layers !== undefined ? this._layers : {};
			return this._layers;
		}
	});

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
				object = this.getSprite( id, template, this.elements );
				break;

			case Timeline.TEXTFIELD:
				object = this.getTextField( id, template );
				break;
		}

		return object;
	};

	/** Updated transform override function. */
	//*
	prototype.updateTransformContainer = prototype.updateTransform;
	prototype.updateTransform = function()
	{
		this.updateTransformContainer();
		
		this.index++;
		this.setFrame( this.index );	
	};
	/*/


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
		this.index = this.getValidIndex( index );

		var template = this.getTemplate( this.id );
		var layers = template.layers;

		this.resolveLayers( layers, index );
	};

	prototype.getValidIndex = function(index)
	{
		var totalFrames = this.getTemplate( this.id ).totalFrames;
		return index % totalFrames;
	};

	prototype.resolveLayers = function(layers, index)
	{
		layers.map( function( layer )
		{
			var elements = this.resolveFrames( layer, index );
			this.layers[ layer.name ] = elements;

		}.bind(this) );
	};

	prototype.resolveFrames = function(layer, index)
	{
		var frames = layer.frames;
		var frame = this.getPrecedingKeyframe( frames, index );
		var elements = frame.elements;

		var list = elements.map( function( element )
		{
			return this.resolveElement( layer.name, frames, element );

		}.bind(this) );


		return list;
	};

	prototype.getPrecedingKeyframe = function(object, index)
	{
		var result = Parse( object ).reduce( function(property, value, item)
		{
			var frameIndex = Number( property );
			item = frameIndex >= item && frameIndex <= index ? frameIndex : item;

			return item;

		}.bind(this), 0 );


		var frame = object[ result ];
		return frame;
	};


	prototype.resolveElement = function(layerName, frames, element)
	{
		// var displayObject = this.getDisplayObjectWithID( )

		var displayObject = this.getDisplayObject( layerName, element.id );

		if( displayObject )
		{
			this.addTransformData( displayObject, element, frames );
			this.addChild( displayObject );
		}

		return displayObject;
	};

	prototype.getDisplayObject = function(layerName, id)
	{
		var displayObject = null;
		var layer = this.layers[ layerName ];

		if( layer )
		{
			displayObject = layer.find( function(element)
			{
				return element && element.id == id;
			});
		}

		displayObject = displayObject || this.parse( id );

		return displayObject;
	};



	/** MovieClip functions. */
	prototype.getMovieClip = function(id, template, elements)
	{
		var json = this.getAtlasJSONWithID( elements, id );
		var textures = this.getTextures( elements, json, id );

		var animations = this.getBeginEndObject( template, "labels" );
		var comments = this.getBeginEndObject( template, "comments" );

		var movieClip = new pixijs.MovieClip( textures, animations, comments );

		return movieClip;
	};

	prototype.getBeginEndObject = function(template, name)
	{
		var object = template[ name ];

		if( object )
		{
			var compare = this.getFirstBiggerValue;
			var totalFrames = template.totalFrames;

			var item = Parse( object ).reduce( function(property, begin, result0)
			{
				result0[ property ] = result0[ property ] || { begin:begin, end:totalFrames };

				Parse( object ).reduce( function(property, value, result1)
				{
					// result1.end = value < result1.end && value > result1.begin ? value : result1.end;
					result1.end = compare( result1.end, value );
					return result1;

				}, result0[ property ] );

				return result0;

			}, {} );
			
			return item;
		}
		else
			return null;
	};

	prototype.getFirstBiggerValue = function(value, compare)
	{
		return value < compare && compare > value ? compare : value;
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


	prototype.getIsValidAtlas = function(element)
	{
		return element.frames && element.meta;
	};

	prototype.nameIsID = function(id)
	{
		return function( property, value )
		{
			var name = this.getFrameIDWithoutIndex( property );
			return name == id;
		};
	};

	prototype.getFrameIDWithoutIndex = function(id)
	{
		return id.slice( 0, -4 );
	};



	/** Sprite functions. */
	prototype.getSprite = function(id, template, elements)
	{
		var json = this.getAtlasJSONWithID( elements, id );
		var texture = this.getTextures( elements, json, id )[ 0 ];

		var sprite = new pixijs.Sprite( texture );

		return sprite;	
	};



	/** TextFieled functions. */
	prototype.getTextField = function()
	{
		
	};



	/** TransformData functions. */
	prototype.addTransformData = function(displayObject, element, frames)
	{
		var clone = Parse( element ).clone();
		var translated = this.translatePivot( clone );

		// if( element.id == "circle" )
		// 	console.log( element.scaleX );

		// console.log( translated );

		Parse( translated ).reduce( function( property, value, result ) 
		{
			if( value !== undefined )
				result[ property ] = value;

			// if( element.id == "circle" && property == "scaleX" )
			// 	console.log( value );

			return result;

		}, displayObject );
	};

	prototype.translatePivot = function(object)
	{
		this.propertyToObjectValue( object, "scaleX", "scale", "x" );
		this.propertyToObjectValue( object, "scaleY", "scale", "y" );

		if( object.pivot )
		{
			object.x += object.pivot.x;
			object.y += object.pivot.y;
		}

		return object;
	};

	prototype.propertyToObjectValue = function(object, property, name, value)
	{
		if( object[ property ] )
		{
			var item = object[ name ] = object[ name ] || {};
			item[ value ] = object[ property ];

			delete object[ property ];
		}
	};

	prototype.getNextIndex = function(index, frames)
	{
		var next = 0;

		Parse( frames ).reduce( function(property, value)
		{
			next = this.getFirstBiggerValue( next, property );


		}.bind(this), next );

		console.log( next );
	};

}(window));