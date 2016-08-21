Execute.file( "helper.jsfl" );
Execute.file( "json-object.jsfl" );


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
	 * Private interface.
	 */

	prototype.init = function()
	{
		this.initVariables();
		this.initTimelineRecursion();
	};

	prototype.initVariables = function()
	{
		this.library = {};
	};

	prototype.initTimelineRecursion = function()
	{
		flash.outputPanel.clear();
		
		this.parse( this.timeline );

		flash.trace("\n\n......");
		var json = JSON.encode( this.library );

		flash.trace( json );
	};


	/** Parse timeline recursively */
	prototype.parse = function(item)
	{
		var type = Helper.getType( item );
		var object = null;

		switch( type )
		{
			case Helper.TYPE_TIMELINE:
				object = this.parseLibrary( item );
				break;

			case Helper.TYPE_LIBRARY_ITEM:
				object = this.parseLibrary( item.timeline );
				break;

			case Helper.TYPE_INSTANCE:
				object = this.parseLibrary( item.libraryItem.timeline );
				break;
		}

		return object;
	};


	prototype.parseLibrary = function(timeline)
	{
		var libraryItem = timeline.libraryItem || { name:"" };
		var name = libraryItem.name;
		
		var timelineIsInLibrary = this.library[ name ] !== undefined;

		if( timelineIsInLibrary )
			return name;
		else
		{
			var object = this.parseTimeline( timeline, name );
			this.library[ name ] = object;

			return object;
		}
	};


	/** Timeline parsing. */
	prototype.parseTimeline = function(timeline, name)
	{
		var object = { type:Helper.TYPE_TIMELINE, name:name, layers:[] };
		var layers = timeline.layers;

		for(var i = 0; i < layers.length; ++i)
		{
		    var layer = layers[ i ];
		    var item = this.parseLayer( layer );

		    object.layers.push( item );
		}		

		return object;
	};

	prototype.parseLayer = function(layer)
	{
		var object = { name:layer.name, frames:{} }
		var frames = layer.frames;

		for(var i = 0; i < frames.length; ++i)
		{
		    var frame = frames[ i ];
		    var item = this.parseFrame( frame );

		    var isKeyframe = frame.startFrame == i;

		    if( isKeyframe )
		    	object.frames[ i ] = item;
		}

		return object;
	};

	prototype.parseFrame = function(frame)
	{
		var object = [];
		var elements = frame.elements;

		for(var i = 0; i < elements.length; ++i)
		{
		    var element = elements[ i ];
			var item = this.parse( element );


			// if item is timeline replace item object with string to avoid
			// library duplicates.		
			var itemIsTimeline = item != undefined && item.type == Helper.TYPE_TIMELINE;
			
			if( itemIsTimeline )
				item = item.name;
			

		    object.push( item );
		}

		if( object.length > 0 )
			return object;
		else
			return null;
	};

}(window));