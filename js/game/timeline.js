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
		this.currentFrame = 0;
		this.currentLabel = null;

		this.setFrame( 0 );
	}


	/**
	 * Getter / Setter
	 */

	Object.defineProperty( prototype, "totalFrames", 
	{
		get: function() 
		{	
			return this.template.totalFrames;
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

	Object.defineProperty( prototype, "template", 
	{
		get: function() 
		{	
			this._tempalte = this._tempalte !== undefined ? this._tempalte : this.getTemplate( this.id );
			return this._tempalte;
		}
	});

	Object.defineProperty( prototype, "labels", 
	{
		get: function() 
		{	
			return this.template.labels;
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
		if( this.isPlaying )
			this.setFrame( this.currentIndex + 1 );
	};

	prototype.gotoAndStop = function(frame)
	{
		frame = this.inputToFrame( frame );

		this.setFrame( frame );
		this.stop();
	};

	prototype.gotoAndPlay = function(frame)
	{
		frame = this.inputToFrame( frame );

		this.setFrame( frame );
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


	prototype.inputToFrame = function(frame)
	{
		if( typeof frame == "number" )
			return frame;
		else
		{
			this.currentLabel = frame;
			var index = this.labels[ this.currentLabel ];

			return index;
		}
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

	prototype.setFrame = function(currentIndex)
	{
		// this.currentIndex = currentFrame % this.template.totalFrames;
		this.currentIndex = currentIndex;
		this.currentFrame = this.getValidIndex( this.currentIndex );

		this.resolveLayers( this.template.layers, this.currentFrame );
	};

	prototype.getValidIndex = function(currentIndex)
	{
		if( this.currentLabel === null )
		{
			var totalFrames = this.template.totalFrames;
			return currentIndex % totalFrames;
		}
		else
		{
			var beginEnd = this.getBeginEndObject( this.template, "labels" );
			var range = beginEnd[ this.currentLabel ];

			var frame = ( range.begin + ( currentIndex % ( range.end - range.begin ) ) );
			// console.log( range.end, range.begin );
			
			return frame;
		}
	};

	prototype.resolveLayers = function(layers, currentFrame)
	{
		layers.forEach( function(layer, depth )
		{
			var elements = this.resolveFrames( layer, depth, currentFrame );
			var id = this.getLayerID( layer.name, depth );

			this.layers[ id ] = elements;

		}.bind(this) );
	};

	prototype.resolveFrames = function(layer, depth, currentFrame)
	{
		var frames = layer.frames;
		var previousIndex = this.getPreviousIndex( frames, currentFrame );
		var frame = frames[ previousIndex ];
		var elements = frame.elements;
		var layerID = this.getLayerID( layer.name, depth );

		this.removeMissingReferences( layerID, elements );

		var list = elements.map( function( element )
		{
			return this.resolveElement( layerID, element, frames, currentFrame );

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

	prototype.resolveElement = function(layerID, element, frames, currentFrame)
	{
		var id = element.id;
		var displayObject = this.getDisplayObject( layerID, id );

		if( displayObject )
		{
			this.addTransformData( id, displayObject, frames, currentFrame );
			this.syncMovieClipFrame( displayObject, element, currentFrame );
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


	prototype.syncMovieClipFrame = function(displayObject, element, currentFrame)
	{
		var list = 
		[
			pixijs.MovieClip,
			pixijs.Timeline
		];

		if( this.getIsInstanceOf( displayObject, list ) )
		{
			if( element.loop || element.firstFrame !== undefined )
			{
				if( element.loop == "single frame" )
				{
					frame = element.firstFrame;
				}
				else
				{
					var previousIndex = this.getPreviousIndex( currentFrame );
					var firstFrame = element.firstFrame || 0;
					var frame = previousIndex + firstFrame + currentFrame;

					if( element.loop == "play once" )
						frame = Math.min( frame, displayObject.totalFrames );
				}
				
				displayObject.setFrame( frame );
			}
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

			var item = Parse( object ).reduce( function(property, begin, result)
			{
				result[ property ] = result[ property ] || { begin:begin, end:totalFrames };

				var compare = result[ property ];

				Parse( object ).forEach( function(property, value)
				{
					compare.end = value < compare.end && value > compare.begin ? value : compare.end; 
				});

				return result;

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
	prototype.addTransformData = function(id, displayObject, frames, currentFrame)
	{
		var previousIndex = this.getPreviousIndex( frames, currentFrame );
		var previousKeyframe = frames[ previousIndex ];

		var hasAnimation = previousKeyframe.animation/* && previousKeyframe.animation.length > 0*/;

		var nextIndex = this.getNextKeyframe( frames, currentFrame );
		var nextKeyframe = hasAnimation ? frames[ nextIndex ] : previousKeyframe;

		var percent = this.getPercent( previousIndex, nextIndex, currentFrame );

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

	prototype.getPercent = function(previous, next, currentFrame )
	{
		var n0 = ( currentFrame - previous );
		var n1 = ( next - previous );
		var result = n1 !== 0 ? ( n0 / n1 ) : 0;

		return result;
	};

	prototype.getTransform = function(frames, previous, next, id, percent)
	{
		var animation = previous.animation;

		var previousItem = this.translateAlpha( this.getFrameTransform( previous, id ) );
		var nextItem = this.translateAlpha( this.getFrameTransform( next, id ) );


		var p = this.getBezierPoints( animation );
		// var p = this.getBezierPointsSubset( bezierPoints, percent );

		var progress = Bezier.getY( percent, p[ 0 ], p[ 1 ], p[ 2 ], p[ 3 ] );
		var transform = this.getTransformBetweenItems( previousItem, nextItem, progress );

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

		if( animation && animation.length > 0 )
		{
			points = animation.concat();

			points.unshift( Bezier.p00 );
			points.push( Bezier.p11 );
		}
		else
			points = Bezier.linearTransition;
		
		return points;
	};

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


	prototype.getPreviousIndex = function(object, currentFrame)
	{
		var result = Parse( object ).reduce( function(property, value, item)
		{
			var frameIndex = Number( property );
			item = frameIndex >= item && frameIndex <= currentFrame ? frameIndex : item;

			return item;

		}.bind(this), 0 );


		return result;
	};

	prototype.getNextKeyframe = function(object, currentFrame)
	{
		var biggestValue = Parse( object ).reduce( function( property, value, item )
		{
			var frameIndex = Number( property );
			return frameIndex > item ? frameIndex : item;

		}, 0 );


		var result = Parse( object ).reduce( function(property, value, item)
		{
			var frameIndex = Number( property );
			item = frameIndex <= item && frameIndex >= currentFrame ? frameIndex : item;

			return item;

		}.bind(this), biggestValue );


		return result;
	};

}(window));