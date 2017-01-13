(function(window){

	window.JSONTimelineParser = JSONTimelineParser;

	var prototype = JSONTimelineParser.prototype = new Object();
	prototype.constructor = JSONTimelineParser;


	JSONTimelineParser.JOIN_FONTFACE = false;

	function JSONTimelineParser(setup)
	{
		Object.call( this );

		this.timeline = setup.timeline;

		this.init();
	}


	/**
	 * Getter / Setter
	 */

	prototype.getLibraryObject = function(id)
	{
		return this.library[ id ];
	};


	/**
	 * Private interface.
	 */

	prototype.init = function()
	{
		this.initVariables();
		this.initTimelineRecursion();
	};

	prototype.initVariables = function()
	{
		this.data = 
		{
			meta: { root:this.timeline.name },
			library: {},
			resources: []
		};

		this.symbols = [];
		this.timelines = [];
		this.library = this.data.library;
		this.numTextFields = 0;
	};

	prototype.initTimelineRecursion = function()
	{
		flash.outputPanel.clear();
		this.parse( this.timeline );
	};


	/** Parse timeline recursively */
	prototype.parse = function(element)
	{
		var type = Helper.getItemType( element );
		var object = null;

		switch( type )
		{
			case Helper.TIMELINE:
				object = this.parseTimeline( element );
				break;

			case Helper.LIBRARY_ITEM:
				object = this.parseTimeline( element.timeline );
				break;

			case Helper.INSTANCE:
				object = this.parseTimeline( element.libraryItem.timeline );
				break;

			case Helper.GRAPHIC:
				object = this.parseGraphic( element );
				break;

			case Helper.TEXT:
				object = this.parseText( element );
				break;
		}

		this.addToLibrary( object );

		return object;
	};


	/** Timeline parsing. */
	prototype.parseTimeline = function(timeline, depth)
	{
		var libraryItem = timeline.libraryItem || { name:this.timeline.name };
		
		var object = 
		{ 
			type: Helper.TIMELINE, 
			id: libraryItem.name,
			totalFrames: timeline.frameCount
		};
		
		var layers = timeline.layers;


		var objectLayers = [];

		for(var i = layers.length - 1; i >= 0; --i)
		{
		    var layer = layers[ i ];
		    
		    if( layer.layerType == "normal" )
		    {
			    var item = this.parseLayer( layer );

			    if( item != null )
			    	objectLayers.push( item );
			}
		}		


		if( objectLayers.length > 0 )
			object.layers = objectLayers;

		this.timelines.push( timeline );

		return object;
	};

	prototype.parseLayer = function(layer)
	{
		var object = { name:layer.name, frames:{} }
		var frames = layer.frames;
		var numFrames = 0;

		for(var i = 0; i < frames.length; ++i)
		{
		    var frame = frames[ i ];
		    var isKeyframe = frame.startFrame == i;
		    
		    if( isKeyframe )
		    {
			    var item = this.parseFrame( frame, i );

			    if( item != null )
			    {
			    	numFrames++;
			    	object.frames[ i ] = item;
			    }
			}
		}

		if( numFrames > 0 )
			return object;
		else
			return null;
	};


	/** Frame parsing. */
	prototype.parseFrame = function(frame, index)
	{
		var object = { elements:[] };
		var elements = frame.elements;

		object = this.parseAnimation( object, frame );

		for(var i = 0; i < elements.length; ++i)
		{
		    var element = elements[ i ];
			var item = this.parse( element, i );

			if( item != null )
			{								
				var itemIsInLibrary = this.getLibraryObject( item.id );

				if( itemIsInLibrary )
					item = { id: item.id };
				
				item = this.addItemTransformData( item, element, i );

			    object.elements.push( item );
		    }
		}

		return object;
	};

	prototype.parseAnimation = function(object, frame)
	{
		if( frame.tweenType != "none" )
		{
			var ease = frame.getCustomEase( "all" );
			var animation = ease.splice( 1, ease.length - 2 );

			for( var property in animation )
			{
				var value = animation[ property ];

				value.x = this.getFixedValue( value.x, 4 );
				value.y = this.getFixedValue( value.y, 4 );
			}

			object.animation = animation;
		}

		return object;
	};


	/** Graphic parsing. */
	prototype.parseGraphic = function(item, depth)
	{
		var libraryItem = item.libraryItem;
		var timeline = libraryItem.timeline;
		var isMovieClip = timeline.frameCount > 1;
		var type = isMovieClip ? Helper.MOVIECLIP : Helper.SPRITE;
		

		var object = 
		{ 
			type: type, 
			id: libraryItem.name,
			/*,name:item.name*/
		};
		

		if( isMovieClip )
			object.totalFrames = timeline.frameCount
		

		var isInLibrary = this.getLibraryObject( object.id );

		if( !isInLibrary )
		{
			this.symbols.push( libraryItem );
			this.timelines.push( timeline );
		}


		return object;
	};


	/** Text parsing. */
	prototype.parseText = function(element, depth)
	{
		var id = "text" + this.numTextFields++;
		var object = { type:Helper.TEXTFIELD, id:/*element.name || */id };

		var text = this.getTextFieldText( element );

		this.addProperty( object, "text", text, "" );

		var style = {};

		this.addProperty( style, "fontFamily", element.getTextAttr( "face" ), "" );
		this.addProperty( style, "fontSize", element.getTextAttr( "size" ), "" );
		this.addProperty( style, "fontWeight", element.getTextAttr( "bold" ) ? "bold" : "", "" );
		this.addProperty( style, "fill", element.getTextAttr( "fillColor" ), "" );
		this.addProperty( style, "align", element.getTextAttr( "alignment" ), "" );
		
		
		var margin =
		{
			x: element.x,
			y: element.y,
			width: element.width,
			height: element.height
		};
		
		this.addProperty( object, "style", style, null );
		this.addProperty( object, "margin", margin, null );

		return object;
	};

	prototype.getTextFieldText = function(element)
	{
		var string = element.getTextString();
		var text = "";

		element.textLines.forEach( function(textLine, index, list)
		{
			var startIndex = textLine.startIndex;
			var length = textLine.length;

			var suffix = index == list.length - 1 ? "" : "\n";
			var line = string.slice( startIndex, startIndex + length );
			text += line + suffix;
		});

		text = text.split( "\"" ).join( "\\\"" ).split( /\r\n|\r|\n/g ).join( "\\n" );

		return text;
	};


	/** Add object to data library. */
	prototype.addToLibrary = function(object)
	{
		if( object )
		{
			var isInLibrary = this.getLibraryObject( object.id );

			if( !isInLibrary )
			{
				var item = this.deepCopyObject( object );
				delete item.id;
				
				this.library[ object.id ] = item;
			}
		}
	};

	prototype.deepCopyObject = function(object)
	{
		var parse = function(object, item)
		{
			for( var property in object )
			{
				var value = object[ property ];

				if( value instanceof Array )
					item[ property ] = parse( value, [] );
				else
				if( typeof value == "object" )
					item[ property ] = parse( value, {} );
				else
					item[ property ] = value;
			}

			return item;
		};

		var item = parse( object, {} );

		return item;
	};


	/** Transform data function. Parse item and add values to object. */
	prototype.addItemTransformData = function(object, element, depth)
	{
		var object = this.addAnimationTransformData( object, element );
		object = this.addUID( object, depth );
		// flash.trace( JSON.encode( object ) );
		object = this.addTextFieldsLineSpacingDisplacement( object, element );
		object = this.addGraphicLoopFrames( object, element );

		return object;
	};

	prototype.addUID = function(object, depth)
	{
		// depth = depth === 0 ? "" : "-" + depth;
		object.uid = object.id + "-" + depth;
		return object;
	};

	prototype.addAnimationTransformData = function(object, element)
	{
		var inputIsValid = element !== null && object !== null;
		var elementHasPropertys = typeof element == "object";
		var alpha = isNaN( element.colorAlphaPercent ) ? 1 : element.colorAlphaPercent / 100;

		if( inputIsValid && elementHasPropertys )
		{
			this.addProperty( object, "type", Helper.getExportType( element ) );
			this.addProperty( object, "name", element.name, "" );
			this.addProperty( object, "alpha", alpha, 1 );
			this.addProperty( object, "visible", element.visible, true );
			this.addProperty( object, "matrix", element.matrix );
		}

		return object;
	};

	prototype.addTextFieldsLineSpacingDisplacement = function(object, element)
	{
		if( element.getTextAttr )
			object.matrix.ty += element.getTextAttr( "lineSpacing" );

		return object;
	};

	prototype.addGraphicLoopFrames = function(object, element)
	{
		this.addProperty( object, "graphicLoop", element.loop, undefined );
		this.addProperty( object, "firstFrame", element.firstFrame || 0, function(value){ return isNaN(value) } );
		
		return object;
	};

	prototype.addProperty = function(object, name, value, ignore, fixed)
	{
		var bool = true;

		if( typeof ignore == "function" )
			bool = !ignore( value );
		else
			bool = value !== ignore

		if( bool )
			object[ name ] = value;

		return object;
	};

	prototype.getFixedValue = function(value, position)
	{
		var object = value.toFixed( position );
		
		while( object[ object.length - 1 ] == "0" )
			object = object.slice( 0, object.length - 1 );
		
		if( object[ object.length - 1 ] == "." )
			object = object.slice( 0, object.length - 1 );

		return Number( object );
	};

}(window));