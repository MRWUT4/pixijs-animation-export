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

	prototype.getLibraryObject = function(name)
	{
		return this.library[ name ];
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
			library: {},
			resources: []
		};

		this.symbols = [];
		this.timelines = [];
		this.library = this.data.library;
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
	prototype.parseTimeline = function(timeline, name)
	{
		var libraryItem = timeline.libraryItem || { name:"root" };
		var object = { name:libraryItem.name };
		var layers = timeline.layers;

		var objectLayers = [];

		for(var i = 0; i < layers.length; ++i)
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
				var itemIsInLibrary = this.library[ item.name ] != undefined;

				if( itemIsInLibrary )
					item = { name:item.name };
				
				var item = this.addItemTransformData( item, element );

			    object.elements.push( item );
		    }
		}

		
		if( object.elements.length > 0 )
			return object;
		else
			return null;
	};

	prototype.parseAnimation = function(object, frame)
	{
		var tweenEasing = frame.tweenEasing;

		if( tweenEasing )
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
	prototype.parseGraphic = function(item)
	{
		var libraryItem = item.libraryItem;
		var object = { name:libraryItem.name };
		
		var isInLibrary = this.getLibraryObject( object.name );

		if( !isInLibrary )
		{
			this.symbols.push( libraryItem );
			this.timelines.push( libraryItem.timeline );
		}

		return object;
	};


	/** Text parsing. */
	prototype.parseText = function(element)
	{
		var object = { name:element.name || "text" };
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

		this.addProperty( object, "name", object.name, null );
		this.addProperty( object, "text", text, "" );
		this.addProperty( object, "lineSpacing", element.getTextAttr( "lineSpacing" ), 0 );
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
			var isInLibrary = this.getLibraryObject( object.name );

			if( !isInLibrary )
				this.library[ object.name ] = object;
		}
	};


	/** Transform data function. Parse item and add values to object. */
	prototype.addItemTransformData = function(object, element)
	{
		var inputIsValid = element !== null && object !== null;
		var elementHasPropertys = typeof element == "object";

		if( inputIsValid && elementHasPropertys )
		{
			// this.addProperty( object, "elementType", element.elementType );
			// this.addProperty( object, "height", element.height, 0 );
			// this.addProperty( object, "width", element.width, 0 );
			this.addProperty( object, "type", Helper.getExportType( element ) );
			this.addProperty( object, "rotation", element.rotation, 0 );
			this.addProperty( object, "scaleX", element.scaleX, 1, 4 );
			this.addProperty( object, "scaleY", element.scaleY, 1, 4 );
			this.addProperty( object, "x", element.x, 0 );
			this.addProperty( object, "y", element.y, 0 );
		}

		return object;
	};

	prototype.addProperty = function(object, name, value, ignore, fixed)
	{
		if( value !== ignore )
			object[ name ] = fixed === undefined ? value : this.getFixedValue( value, fixed );

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