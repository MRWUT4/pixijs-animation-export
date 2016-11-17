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
			meta: {},
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
	prototype.parse = function(item)
	{
		var type = Helper.getItemType( item );
		var object = null;

		switch( type )
		{
			case Helper.TIMELINE:
				object = this.parseTimeline( item );
				break;

			case Helper.LIBRARY_ITEM:
				object = this.parseTimeline( item.timeline );
				break;

			case Helper.INSTANCE:
				object = this.parseTimeline( item.libraryItem.timeline );
				break;

			case Helper.GRAPHIC:
				object = this.parseGraphic( item );
				break;

			case Helper.TEXT:
				object = this.parseText( item );
				break;
		}

		this.addToLibrary( object );

		return object;
	};


	/** Timeline parsing. */
	prototype.parseTimeline = function(timeline, id)
	{
		var libraryItem = timeline.libraryItem || { name:"root" };
		
		var object = 
		{ 
			type: Helper.TIMELINE, 
			id: libraryItem.name,
			totalFrames: timeline.frameCount
		};
		
		var layers = timeline.layers;


		var objectLayers = [];

		// for(var i = 0; i < layers.length; ++i)
		// {
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
			var item = this.parse( element );

			if( item != null )
			{								
				var itemIsInLibrary = this.getLibraryObject( item.id );

				if( itemIsInLibrary )
					item = { id:item.id };
				
				item = this.addItemTransformData( item, element );

			    object.elements.push( item );
		    }
		}

		return object;
	};

	prototype.parseAnimation = function(object, frame)
	{
		// var tweenEasing = frame.tweenEasing;

		if( frame.tweenType != "none" )
		{
			var ease = frame.getCustomEase( "all" );
			var animation = ease.splice( 1, ease.length - 2 );

			// for( var property in animation )
			// {
			// 	var value = animation[ property ];

			// 	value.x = this.getFixedValue( value.x, 4 );
			// 	value.y = this.getFixedValue( value.y, 4 );
			// }

			object.animation = animation;
		}

		return object;
	};


	/** Graphic parsing. */
	prototype.parseGraphic = function(item)
	{
		var libraryItem = item.libraryItem;
		var timeline = libraryItem.timeline;
		var isMovieClip = timeline.frameCount > 1;
		var type = isMovieClip ? Helper.MOVIECLIP : Helper.SPRITE;
		

		var object = 
		{ 
			type: type, 
			id: libraryItem.name
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
	prototype.parseText = function(element)
	{
		var id = "text" + /*( !element.name ?*/ this.numTextFields++ /*: this.numTextFields )*/;
		var object = { type:Helper.TEXTFIELD, id:/*element.name || */id };
		var text = element.getTextString().split( "\"" ).join( "\\\"" ).split( /\r\n|\r|\n/g ).join( "\\n" );

		var style = 
		{
			font: this.getTextElementStyle( element ),
			fill: element.getTextAttr( "fillColor" ),
			align: element.getTextAttr( "alignment" )
		};

		var margin =
		{
			width: element.width,
			height: element.height
		};

		// this.addProperty( object, "name", object.name, null );
		this.addProperty( object, "text", text, "" );
		// this.addProperty( object, "lineSpacing", element.getTextAttr( "lineSpacing" ), 0 );
		this.addProperty( object, "style", style, null );
		this.addProperty( object, "margin", margin, null );

		return object;
	};

	prototype.getTextElementStyle = function(element)
	{
		var string = "";
		var bold = element.getTextAttr( "bold" );

		string += bold ? "bold " : "";
		string += element.getTextAttr( "size" ) + "px ";
		string += JSONTimelineParser.JOIN_FONTFACE ? element.getTextAttr( "face" ).split( " " ).join( "_" ) : element.getTextAttr( "face" ).split( " " )[ 0 ];

		return string;
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
	prototype.addItemTransformData = function(object, element)
	{
		var object = this.addAnimationTransformData( object, element );
		object = this.addTextFieldsLineSpacingDisplacement( object, element );
		object = this.addGraphicLoopFrames( object, element );

		return object;
	};

	prototype.addAnimationTransformData = function(object, element)
	{
		var inputIsValid = element !== null && object !== null;
		var elementHasPropertys = typeof element == "object";

		var transform = element.getTransformationPoint();
		var pivot = transform.x || transform.y ? { x:transform.x, y: transform.y } : null;
		var alpha = isNaN( element.colorAlphaPercent) ? 1 : element.colorAlphaPercent / 100;

		if( inputIsValid && elementHasPropertys )
		{
			// this.addProperty( object, "elementType", element.elementType );
			this.addProperty( object, "type", Helper.getExportType( element ) );
			this.addProperty( object, "name", element.name, "" );
			this.addProperty( object, "x", element.x, null );
			this.addProperty( object, "y", element.y, null );
			this.addProperty( object, "alpha", alpha, 1 );
			// this.addProperty( object, "width", element.width, 0 );
			// this.addProperty( object, "height", element.height, 0 );
			this.addProperty( object, "rotation", element.rotation, function(value){ return isNaN(value) } );
			this.addProperty( object, "scaleX", element.scaleX, null, 4 );
			this.addProperty( object, "scaleY", element.scaleY, null, 4 );
			// this.addProperty( object, "pivot", pivot, null );
			// this.add
		}

		return object;
	};

	prototype.addTextFieldsLineSpacingDisplacement = function(object, element)
	{
		if( element.getTextAttr )
			object.y += element.getTextAttr( "lineSpacing" );

		return object;
	};

	prototype.addGraphicLoopFrames = function(object, element)
	{
		// var firstFrame = firstFrame !== undefined ? element.firstFrame : 0;
		// var loop = loop !== undefined ? element.loop : "loop";

		this.addProperty( object, "loop", element.loop || "loop", "loop" );
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
			object[ name ] = /*fixed === undefined ?*/ value/* : this.getFixedValue( value, fixed )*/;

		return object;
	};

	// prototype.getFixedValue = function(value, position)
	// {
	// 	var object = value.toFixed( position );
		
	// 	while( object[ object.length - 1 ] == "0" )
	// 		object = object.slice( 0, object.length - 1 );
		
	// 	if( object[ object.length - 1 ] == "." )
	// 		object = object.slice( 0, object.length - 1 );

	// 	return Number( object );
	// };

}(window));