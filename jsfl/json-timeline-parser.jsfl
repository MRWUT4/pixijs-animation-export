(function(window){

	window.JSONTimelineParser = JSONTimelineParser;

	var prototype = JSONTimelineParser.prototype = new Object();
	prototype.constructor = JSONTimelineParser;


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
			assets:
			{
				animations: [],
				resources: []
			}
		};

		this.assets = [];
		this.library = this.data.library;
	};

	prototype.initTimelineRecursion = function()
	{
		flash.outputPanel.clear();
		this.parse( this.timeline );
		
		// var json = JSON.encode( this.data );
		// flash.trace( json );
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
		}

		this.addToLibrary( object );

		return object;
	};


	/** Timeline parsing. */
	prototype.parseTimeline = function(timeline, name)
	{
		var object = { name:timeline.libraryItem.name || "root" };
		var layers = timeline.layers;

		var objectLayers = [];

		for(var i = 0; i < layers.length; ++i)
		{
		    var layer = layers[ i ];
		    var item = this.parseLayer( layer );

		    if( item != null )
		    	objectLayers.push( item );
		}		

		if( objectLayers.length > 0 )
			object.layers = objectLayers;

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
		    var item = this.parseFrame( frame );

		    var isKeyframe = frame.startFrame == i;

		    if( isKeyframe && item != null )
		    {
		    	numFrames++;
		    	object.frames[ i ] = item;
		    }
		}

		if( numFrames > 0 )
			return object;
		else
			return null;
	};

	prototype.parseFrame = function(frame)
	{
		var object = [];
		var elements = frame.elements;

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

			    object.push( item );
		    }
		}


		if( object.length > 0 )
			return object;
		else
			return null;
	};


	/** Graphic parsing. */
	prototype.parseGraphic = function(item)
	{
		var libraryItem = item.libraryItem;
		var object = { name:libraryItem.name };
		
		var isInLibrary = this.getLibraryObject( object.name );

		if( !isInLibrary )
			this.assets.push( libraryItem );

		return object;
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
	prototype.addItemTransformData = function(object, item)
	{
		var inputIsValid = item !== null && object !== null;
		var itemHasPropertys = typeof item == "object";

		if( inputIsValid && itemHasPropertys )
		{
			this.addProperty( object, "type", Helper.getExportType( item ) );
			// this.addProperty( object, "elementType", item.elementType );
			this.addProperty( object, "rotation", item.rotation, 0 );
			this.addProperty( object, "scaleX", item.scaleX, 1 );
			this.addProperty( object, "scaleY", item.scaleY,1 );
			this.addProperty( object, "height", item.height, 0 );
			this.addProperty( object, "width", item.width, 0 );
			this.addProperty( object, "x", item.x, 0 );
			this.addProperty( object, "y", item.y, 0 );
		}

		return object;
	};

	prototype.addProperty = function(object, name, value, ignore)
	{
		if( value !== ignore )
			object[ name ] = value;

		return object;
	};

}(window));