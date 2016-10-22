(function(window){

	window.pixijs = window.pixijs || {};
	window.pixijs.Timeline = Timeline;

	var prototype = Timeline.prototype = Object.create( pixijs.DisplayObjectContainer.prototype );
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
		this.isPlaying = true;

		this.setFrame( 0 );
	}


	/**
	 * Getter / Setter
	 */

	Object.defineProperty( prototype, "totalFrames", 
	{
		get: function() 
		{	
			if( !this._totalFrames )
			{
				var template = this.getTemplate( this.id );
				this._totalFrames = template.totalFrames;
			}

			return this._totalFrames;
		}
	});

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
	 * Overwrite interface.
	 */

	/** Updated transform override function. */
	//*
	prototype.updateTransformContainer = prototype.	updateTransform;
	prototype.updateTransform = function()
	{
		this.updatePlayback();
		this.updateTransformContainer();
		// console.log( this.children.length );
	};
	//*/


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



	prototype.updatePlayback = function()
	{
		//*
		if( this.isPlaying )
			this.setFrame( this.index + 1 );
		//*/
	};

	prototype.gotoAndStop = function(index)
	{
		this.setFrame( index );
		this.stop();
	};

	prototype.gotoAndPlay = function()
	{
		this.setFrame( index );
		this.play();
	};

	prototype.play = function()
	{
		this.isPlaying = true;
	};

	prototype.stop = function()
	{
		this.isPlaying = false;
	};


	/**
	 * Private interface.
	 */

	prototype.getLayerID = function(name, depth)
	{
		var suffix = depth !== null ? "#" + depth : "";
		var id = name + suffix;

		return id;
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

		return timeline;
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
		layers.forEach( function(layer, depth )
		{
			var elements = this.resolveFrames( layer, depth, index );
			var id = this.getLayerID( layer.name, depth );

			// this.getLayer( id, elements )
			this.layers[ id ] = elements;

		}.bind(this) );
	};

	prototype.resolveFrames = function(layer, depth, index)
	{
		var frames = layer.frames;
		var previousIndex = this.getPreviousIndex( frames, index );
		var frame = frames[ previousIndex ];
		var elements = frame.elements;
		var layerID = this.getLayerID( layer.name, depth );

		this.removeMissingReferences( layerID, elements );

		var list = elements.map( function( element )
		{
			return this.resolveElement( layerID, element, frames, index );

		}.bind(this) );


		return list;
	};

	prototype.removeMissingReferences = function(layerID, elements)
	{
		var layer = this.layers[ layerID ];

		if( layer )
		{
			layer.forEach( function(child)
			{
				element = elements.find( function(element)
				{
					return element.id == child.id;
				} );

				if( element == undefined )
					this.removeChild( child );

			}.bind(this) );
		}
	};

	prototype.resolveElement = function(layerID, element, frames, index)
	{
		var id = element.id;
		var displayObject = this.getDisplayObject( layerID, id );

		if( displayObject )
		{
			this.addTransformData( id, displayObject, frames, index );
			this.syncMovieClipFrame( displayObject, element, index );
			this.add( displayObject );
		}

		return displayObject;
	};

	prototype.getDisplayObject = function(layerID, id)
	{
		var displayObject = null;

		// layer = this.getLayer( layerID );
		var layer = this.layers[ layerID ];

		if( !layer )
			layer = this.layers[ layerID ] = [];

		displayObject = layer.find( function(element)
		{
			return element && element.id == id;
		});

		if( !displayObject )
		{
			displayObject = this.parse( id );
			layer.push( displayObject );
		}
		
		return displayObject;
	};


	prototype.syncMovieClipFrame = function(displayObject, element, index)
	{
		var list = 
		[
			pixijs.MovieClip,
			pixijs.Timeline
		];

		if( this.getIsInstanceOf( displayObject, list ) )
		{
			if( element.loop == "single frame" )
				frame = element.firstFrame;
			else
			{
				var previousIndex = this.getPreviousIndex( index );
				var firstFrame = element.firstFrame || 0;
				var frame = previousIndex + firstFrame + index;

				if( element.loop == "play once" )
					frame = Math.min( frame, displayObject.totalFrames );
			}

			displayObject.setFrame( frame );
		}
	};


	prototype.getIsInstanceOf = function(displayObject, list)
	{
		var result = list.find( function(type)
		{
			return displayObject instanceof type;
		});

		return result;
	};


	prototype.add = function(displayObject)
	{
		if( !displayObject.parent )
			this.addChild( displayObject );
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
			var totalFrames = template.totalFrames;

			var item = Parse( object ).reduce( function(property, begin, result0)
			{
				result0[ property ] = result0[ property ] || { begin:begin, end:totalFrames };

				Parse( object ).reduce( function(property, value, result1)
				{
					result1.end = result1.end < value && value > result1.end ? value : result1.end;
					return result1;

				}, result0[ property ] );

				return result0;

			}, {} );
			
			return item;
		}
		else
			return null;
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
	prototype.getTextField = function(item, template)
	{
		return new pixijs.TextField( template.text, template.style, template.margin );;
	};



	/** TransformData functions. */
	prototype.addTransformData = function(id, displayObject, frames, index)
	{
		var previousIndex = this.getPreviousIndex( frames, index );
		var previousKeyframe = frames[ previousIndex ];

		var nextIndex = this.getNextKeyframe( frames, index );
		var nextKeyframe = frames[ nextIndex ];

		var percent = this.getPercent( previousIndex, nextIndex, index );

		var transform = this.getTransform( frames, previousKeyframe, nextKeyframe, id, percent );
		transform = this.translateRotation( transform );
		transform = this.translateScale( transform );

		Parse( transform ).reduce( function( property, value, result ) 
		{
			if( value !== undefined )
				result[ property ] = value;

			return result;

		}, displayObject );
		
		displayObject.name = displayObject.name ? displayObject.name : displayObject.id;
	};

	prototype.getPercent = function(previous, next, index )
	{
		var n0 = ( index - previous );
		var n1 = ( next - previous );
		var result = n1 !== 0 ? ( n0 / n1 ) : 0;

		return result;
	};

	prototype.getTransform = function(frames, previous, next, id, percent)
	{
		var animation = previous.animation;

		var previousItem = this.translateAlpha( this.getFrameTransform( previous, id ) );
		var nextItem = this.translateAlpha( this.getFrameTransform( next, id ) );

		var transform = previousItem;

		var p = this.getBezierPoints( animation );
		// var p = this.getBezierPointsSubset( bezierPoints, percent );

		var progress = Bezier.getY( percent, p[ 0 ], p[ 1 ], p[ 2 ], p[ 3 ] );
		transform = this.getTransformBetweenItems( previousItem, nextItem, progress );

		return transform;
	};

	prototype.getTransformBetweenItems = function(previous, next, progress)
	{
		var floatBetweenAandB = this.floatBetweenAandBAt;

		next = next !== undefined ? next : previous;

		var parse = function(object)
		{
			var transform = {};

			Parse( object ).reduce( function(property, value)
			{
				if( typeof value == "number" )
					transform[ property ] = floatBetweenAandB( value, next[ property ], progress );
				else
				if( typeof value == "object" )
					transform[ property ] = parse( value );
				else
					transform[ property ] = value;
			});

			return transform;
		};

		var transform = parse( previous );
		
		return transform;
	};

	prototype.floatBetweenAandBAt = function(a, b, position)
	{
		return a + position * ( b - a );
	};

	prototype.quadraticBezier = function(t, p0, p1, p2, p3)
	{
		return Math.pow( 1 - t, 3 ) * p0 + 
		3 * Math.pow( 1 - t, 2 ) * t * p1 + 
		3 * ( 1 - t ) * Math.pow( t, 2 ) * p2 + 
		Math.pow( t, 3 ) * p3;
	};

	prototype.getBezierPoints = function(animation)
	{
		var points = null;

		if( animation )
		{
			points = animation.concat();

			points.unshift( Bezier.p00 );
			points.push( Bezier.p11 );
		}
		else
			points = Bezier.linearTransition;
		
		return points;
	};

	// prototype.getBezierPointsSubset = function(list, percent)
	// {
	// 	var div = 4;
	// 	var length = list.length;

	// 	var center = Math.round( length * percent );

	// 	// var begin = Math.floor( ( length * percent ) / div ) * div;
	// 	// begin = Math.min( length - div, begin );

	// 	var result = list.splice( 0, div );


	// 	return result;
	// };

	prototype.getFrameTransform = function(keyframe, id)
	{
		var elements = keyframe.elements;

		var result = elements.find( function(element)
		{
			return element.id == id;
		});

		return result;
	};

	prototype.translateScale = function(object)
	{
		this.propertyToObjectValue( object, "scaleX", "scale", "x" );
		this.propertyToObjectValue( object, "scaleY", "scale", "y" );

		return object;
	};

	// prototype.translatePivot = function(object)
	// {
	// 	if( object.pivot )
	// 	{
	// 		object.x += object.pivot.x * object.scale.x;
	// 		object.y += object.pivot.y * object.scale.y;
	// 	}

	// 	return object;
	// };

	prototype.translateRotation = function(object)
	{
		object.rotation = object.rotation * ( Math.PI / 180 );
		return object;
	};

	prototype.translateAlpha = function(object)
	{
		if( object )
			object.alpha = object.alpha !== undefined ? object.alpha : 1;

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


	prototype.getPreviousIndex = function(object, index)
	{
		var result = Parse( object ).reduce( function(property, value, item)
		{
			var frameIndex = Number( property );
			item = frameIndex >= item && frameIndex <= index ? frameIndex : item;

			return item;

		}.bind(this), 0 );


		return result;
	};

	prototype.getNextKeyframe = function(object, index)
	{
		var biggestValue = Parse( object ).reduce( function( property, value, item )
		{
			var frameIndex = Number( property );
			return frameIndex > item ? frameIndex : item;

		}, 0 );


		var result = Parse( object ).reduce( function(property, value, item)
		{
			var frameIndex = Number( property );
			item = frameIndex <= item && frameIndex >= index ? frameIndex : item;

			return item;

		}.bind(this), biggestValue );


		return result;
	};

}(window));