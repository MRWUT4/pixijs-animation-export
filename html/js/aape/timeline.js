(function(window){

	window.aape = window.aape || {};
	window.aape.Timeline = Timeline;

	var prototype = Timeline.prototype = Object.create( aape.DisplayObjectContainer.prototype );
	prototype.constructor = Timeline;


	Timeline.TIMELINE = "timeline";
	Timeline.MOVIECLIP = "movieclip";
	Timeline.SPRITE = "sprite";
	Timeline.TEXTFIELD = "textfield";

	Timeline.matrix = new PIXI.Matrix();


	function Timeline(setup)
	{
		PIXI.Container.call( this );

		this.json = setup.json;
		this.library = this.json.library;
		this.elements = setup.elements;
		this.id = setup.id || this.json.meta.root;
		this.loop = setup.loop || true;
		this.timeScale = setup.timeScale !== undefined ? setup.timeScale : 1;
		this.onAnimationEnd = setup.onAnimationEnd || null;

		this.isPlaying = true;
		this.currentFrame = null;
		this.currentLabel = null;
		this.beginEndObject = {};

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

	Object.defineProperty( prototype, "timeScale", 
	{
		get: function() 
		{	
			return this._timeScale;
		},
		set: function(value) 
		{	
			this._timeScale = value;

			var that = this;

			aape.Parse( this.layers ).forEach( function(property, vo)
			{	
				var elements = vo.elements;

				elements.forEach( function(child)
				{
					child.timeScale = that._timeScale;
				});
			});
		}
	});



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
		var add = this.isPlaying ? this.timeScale : 0;
		this.setFrame( this.currentIndex + add );
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

	prototype.clone = function()
	{
		return this.getTimeline( this.id );
	};


	prototype.inputToFrame = function(frame)
	{
		if( typeof frame == "number" )
			return frame;
		else
		{
			this.currentLabel = frame;
			this.labelChanged = true;

			return 0;
		}
	};


	Object.defineProperty( prototype, "layers", 
	{
		get: function() 
		{	
			this._layers = this._layers !== undefined ? this._layers : {};
			return this._layers;
		}
	});

	prototype.setLayer = function(id, vo)
	{
		return this.layers[ id ] = vo;
	};

	prototype.getLayer = function(id)
	{
		if( this.layers[ id ] == undefined ) 
		{
			this.layers[ id ] = 
			{
				elements: [],
				previousIndex: null,
				nextIndex: null,
				previousKeyframe: null,
				nextKeyframe: null
			}
		}

		return this.layers[ id ];
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
		var timeline = new aape.Timeline(
		{
			json: this.json,
			elements: this.elements,
			timeScale: this.timeScale,
			id: id
		});

		return timeline;
	};

	prototype.setFrame = function(currentIndex, forceRender)
	{
		if( this.graphicLoop === undefined || forceRender )
		{
			this.currentIndex = currentIndex;
			this.nextFrame = this.getValidIndex( this.template, this.currentIndex );

			this.frameChanged = this.currentFrame === null || this.labelChanged || this.currentFrame.toFixed( 8 ) !== this.nextFrame.toFixed( 8 );
			this.currentFrame = this.nextFrame;

			this.resolveLayers( this.template.layers );
			this.triggerLabelCallback( this.template, this.currentFrame );
	
			this.labelChanged = false;
		}
	};

	prototype.resolveLayers = function(layers)
	{
		layers.forEach( function(layer, depth)
		{
			var vo = this.resolveFrames( layer, depth );
			var id = this.getLayerID( layer.name, depth );

			this.setLayer( id, vo );

		}.bind(this) );
	};

	prototype.resolveFrames = function(layer, depth)
	{
		var layerID = this.getLayerID( layer.name, depth );


		var frames = layer.frames;

		var previousIndex = this.getPreviousIndex( frames, this.currentFrame );
		var previousKeyframe = frames[ previousIndex ];

		var hasAnimation = previousKeyframe.animation;

		var nextIndex = this.getNextIndex( frames, this.currentFrame );
		var nextKeyframe = hasAnimation ? frames[ nextIndex ] : previousKeyframe;				

		var previousElements = previousKeyframe.elements;
		

		var vo = this.getLayer( layerID );

		vo.previousIndex = previousIndex;
		vo.nextIndex = nextIndex;
		vo.previousKeyframe = previousKeyframe;
		vo.nextKeyframe = nextKeyframe;


		var elements = previousElements.map( function( element )
		{
			return this.resolveElement( layerID, element );

		}.bind(this) )

		this.removeMissing( layerID, elements );
		vo.elements = elements;

		return vo;
	};

	prototype.resolveElement = function(layerID, element)
	{
		var id = element.id;
		
		var layerVO = this.getLayer( layerID );
		var displayObject = this.getDisplayObject( layerVO, id, element.uid );

		if( displayObject )
		{
			if( this.frameChanged || this.frameChanged === undefined )
			{
				this.addTransform( element.uid, displayObject, layerVO );
				this.add( displayObject );
			}

			this.sync( displayObject, element, layerVO.previousIndex );
		}

		return displayObject;
	};


	prototype.getDisplayObject = function(layerVO, id, uid)
	{
		var displayObject = null;

		
		displayObject = layerVO.elements.find( function(element)
		{
			return element && element.uid == uid;
		});

		if( !displayObject )
		{
			displayObject = this.parse( id );
			layerVO.elements.push( displayObject );
		}
		
		return displayObject;
	};


	prototype.addTransform = function(uid, displayObject, layerVO)
	{
		var percent = this.getPercent( layerVO.previousIndex, layerVO.nextIndex, this.currentFrame );

		var transform = this.getTransform( layerVO.previousKeyframe, layerVO.nextKeyframe, uid, percent );
		transform = this.translateMatrix( transform, displayObject );
		transform = this.translateVisible( transform );


		aape.Parse( transform ).reduce( function( property, value, result ) 
		{
			if( value !== undefined )
				result[ property ] = value;

			return result;

		}, displayObject );
		
		displayObject.name = displayObject.name ? displayObject.name : displayObject.id;
	},


	/** Sync child frames. */
	prototype.sync = function(displayObject, element, previousIndex)
	{
		var list = 
		[
			aape.MovieClip,
			aape.Timeline
		];


		if( this.getIsInstanceOf( displayObject, list ) )
		{
			var frame = null;

			if( element.graphicLoop !== undefined && element.firstFrame !== undefined )
			{
				if( element.graphicLoop == "single frame" )
					frame = element.firstFrame;
				else
				if( element.graphicLoop == "play once" )
				{
					var template = this.getTemplate( element.id );
					// frame = Math.min( element.firstFrame + this.currentFrame, template.totalFrames - 1 );
					frame = Math.min( this.currentFrame, template.totalFrames - 1 );
				}
				else
				{
					frame = element.firstFrame + this.currentFrame;
				}

				if( displayObject.isPlaying )
					displayObject.setFrame( frame, true );
			}
		}
	},


	/** Trigger callback when animation hits last frame. */
	prototype.triggerLabelCallback = function(template, currentFrame)
	{
		if( this.frameChanged && this.currentLabel !== null && this.onAnimationEnd !== null )
		{
			var beginEndObject = this.getBeginEndObject( template, "labels", this.beginEndObject );
			var object = beginEndObject[ this.currentLabel ];

			if( object.end - 1 == Number( currentFrame.toFixed( 2 ) ) )
				this.onAnimationEnd();
		}
	};


	/** Add child to display list. */
	prototype.add = function(displayObject)
	{
		// if( !displayObject.parent )
			this.addChild( displayObject );
	},

	prototype.removeMissing = function(layerID, elements)
	{
		var layerElements = this.getLayer( layerID ).elements;

		if( layerElements )
		{
			layerElements.forEach( function(child)
			{
				element = elements.find( function(element)
				{
					return element.uid == child.uid;
				});

				if( element == undefined )
					this.removeChild( child );

			}.bind(this) );
		}
	}


	/** Getter */
	prototype.getValidIndex = function(template, currentIndex)
	{
		var frame = null;

		if( this.currentLabel === null )
		{	
			var totalFrames = template.totalFrames;

			if( totalFrames > 1 )
				frame = this.loop ? ( currentIndex % totalFrames ) : ( currentIndex >= totalFrames - 1 ? totalFrames - 1 : currentIndex );
			else
				frame = 0;

			return frame;
		}
		else
		{
			var beginEnd = this.getBeginEndObject( template, "labels" );

			var range = beginEnd[ this.currentLabel ];
			var lastFrame = range.end - range.begin;

			frame = !this.loop && currentIndex >= lastFrame ? ( range.end - 1 ) : ( range.begin + ( currentIndex % lastFrame ) );

			return frame;
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


	/** MovieClip functions. */
	prototype.getMovieClip = function(id, template, elements)
	{
		var json = this.getAtlasJSONWithID( elements, id );
		var textures = this.getTextures( elements, json, id );

		var animations = this.getBeginEndObject( template, "labels" );
		var comments = this.getBeginEndObject( template, "comments" );

		var movieClip = new aape.MovieClip( textures, animations, comments );
		movieClip.pivot = this.getDisplayObjectPivot( id, json );
		movieClip.play();

		return movieClip;
	};

	prototype.getBeginEndObject = function(template, name, modObject)
	{	
		var object = template[ name ];

		if( object )
		{
			var that = this;
			var totalFrames = template.totalFrames;

			var item = aape.Parse( object ).reduce( function(property, value, result)
			{
				result[ value ] = result[ value ] || { begin:0, end:0 };
				
				var beginEnd = result[ value ];

				beginEnd.begin = that.smallestWith( value, object );
				beginEnd.end = that.biggestValueAfter( value, object, beginEnd.begin, totalFrames );

				return result;

			}, modObject || {} );
		}

		return item;
	};

	prototype.smallestWith = function(compare, object)
	{
		var result = null;

		aape.Parse( object ).forEach( function(property, value)
		{
			if( compare == value && ( result === null || property < result ) )
				result = Number( property );
		});

		return result;
	};

	prototype.biggestValueAfter = function(compare, object, begin, totalFrames)
	{
		var result = totalFrames;

		aape.Parse( object ).forEach( function(property, value)
		{
			var frame = Number( property );

			if( frame < result && frame > begin )
				result = frame;
		});

		return result;
	};


	prototype.getFrames = function(frames, id)
	{
		var list = aape.Parse( frames ).filter( this.nameIsID( id ).bind(this) );
		return list;
	};

	prototype.getFilteredFrames = function(frames, id)
	{
		var list = this.getFrames( frames, id );
		list.pop();

		return list;
	};

	prototype.getTextures = function(elements, json, id)
	{
		var frames = this.getFilteredFrames( json.frames, id );
		var baseTexture = this.getBaseTexture( elements, json.meta.image );

		var list = frames.map( function(item, index)
		{
			var itemFrame = item.frame;
			var itemSpriteSourceSize = item.spriteSourceSize;
			var itemSourceSize = item.sourceSize;
			
			var frame = new PIXI.Rectangle( itemFrame.x, itemFrame.y, itemFrame.w, itemFrame.h );
			var orig = undefined;
			var trim = new PIXI.Rectangle( itemSpriteSourceSize.x, itemSpriteSourceSize.y, itemFrame.w, itemFrame.h );

			var texture = new PIXI.Texture( baseTexture, frame, orig, trim );

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
				var path = element.src.split( "/" ).slice( -1 )[ 0 ].split( "?" )[ 0 ];
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
				var hasID = aape.Parse( frames ).every( this.nameIsID( id ).bind(this) );

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

		var sprite = new aape.Sprite( texture );
		sprite.pivot = this.getDisplayObjectPivot( id, json );

		return sprite;	
	};


	prototype.getDisplayObjectPivot = function(id, json)
	{
		var frames = this.getFrames( json.frames, id );

		var result = frames.reduce( function( result, frame )
		{
			var size = frame.spriteSourceSize;

			result.x = size.x > result.x || result.x == null ? size.x : result.x;
			result.y = size.y > result.y || result.y == null ? size.y : result.y;

			return result;

		}, { x:null, y:null } );

		return result;
	};


	/** TextFieled functions. */
	prototype.getTextField = function(item, template)
	{
		var style = new PIXI.TextStyle();

		aape.Parse( template.style ).forEach( function(property, value)
		{
			style[ property ] = value;

		}.bind(this) );

		return new aape.TextField( template.text, style, template.margin );
	};



	/** TransformData functions. */
	prototype.getPercent = function(previous, next, currentFrame )
	{
		var n0 = ( currentFrame - previous );
		var n1 = ( next - previous );
		var result = n1 !== 0 ? ( n0 / n1 ) : 0;

		return result;
	};

	prototype.getTransform = function(previous, next, uid, percent)
	{
		var animation = previous.animation;

		var previousItem = this.translateAlpha( this.getFrameTransform( previous, uid ) );
		var nextItem = this.translateAlpha( this.getFrameTransform( next, uid ) );


		var p = this.getBezierPoints( animation );
		// var p = this.getBezierPointsSubset( bezierPoints, percent );

		var progress = aape.Bezier.getY( percent, p[ 0 ], p[ 1 ], p[ 2 ], p[ 3 ] );
		var transform = this.getTransformBetweenItems( previousItem, nextItem, progress );

		return transform;
	};

	prototype.getTransformBetweenItems = function(previous, next, progress)
	{
		var floatBetweenAandB = this.floatBetweenAandBAt;

		next = next !== undefined ? next : previous;

		var parse = function(object, objectNext)
		{
			var transform = {};

			aape.Parse( object ).reduce( function(property, value)
			{
				if( typeof value == "number" )
				{
					transform[ property ] = floatBetweenAandB( value, objectNext[ property ], progress );
				}
				else
				if( typeof value == "object" )
					transform[ property ] = parse( value, objectNext[ property ] );
				else
					transform[ property ] = value;
			});

			return transform;
		};

		var transform = parse( previous, next );
		
		return transform;
	};

	prototype.floatBetweenAandBAt = function(a, b, position)
	{
		return a + position * ( b - a );
	};

	prototype.getBezierPoints = function(animation)
	{
		var points = null;

		if( animation && animation.length > 0 )
		{
			points = animation.concat();

			points.unshift( aape.Bezier.p00 );
			points.push( aape.Bezier.p11 );
		}
		else
			points = aape.Bezier.linearTransition;
		
		return points;
	};

	prototype.getFrameTransform = function(keyframe, uid)
	{
		var elements = keyframe.elements;

		var result = elements.find( function(element)
		{
			return element.uid == uid;
		});

		return result;
	};


	prototype.translateVisible = function(object)
	{
		object.visible = object.visible !== undefined ? object.visible : true;
		return object;
	};

	prototype.translateMatrix = function(transform, displayObject)
	{
		var matrix = Timeline.matrix;
		var transformMatrix = transform.matrix;

		aape.Parse( transformMatrix ).forEach( function(property, value)
		{
			matrix[ property ] = transformMatrix[ property ];
		});

		matrix.c *= -1;
		displayObject.transform.setFromMatrix( matrix );

		return transform;
	};

	prototype.translateAlpha = function(object)
	{
		if( object )
			object.alpha = object.alpha !== undefined ? object.alpha : 1;

		return object;
	};


	prototype.getPreviousIndex = function(object, currentFrame)
	{
		var result = aape.Parse( object ).reduce( function(property, value, item)
		{
			var frameIndex = Number( property );
			item = frameIndex >= item && frameIndex <= currentFrame ? frameIndex : item;

			return item;

		}.bind(this), 0 );


		return result;
	};

	prototype.getNextIndex = function(object, currentFrame)
	{
		var biggestValue = aape.Parse( object ).reduce( function( property, value, item )
		{
			var frameIndex = Number( property );
			return frameIndex > item ? frameIndex : item;

		}, 0 );


		var result = aape.Parse( object ).reduce( function(property, value, item)
		{
			var frameIndex = Number( property );
			item = frameIndex <= item && frameIndex >= currentFrame ? frameIndex : item;

			return item;

		}.bind(this), biggestValue );


		return result;
	};

}(window));