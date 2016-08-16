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
		this.list = [];
	};

	prototype.initTimelineRecursion = function()
	{
		this.parse( this.timeline );
		
		flash.outputPanel.clear();

		for(var i = 0; i < this.list.length; ++i)
		{
		    var item = this.list[ i ];
		
			var json = JSON.encode( item );
			flash.trace( json );
		}
	};


	prototype.parse = function(item)
	{
		var type = Helper.getType( item );
		var object = null;

		switch( type )
		{
			case Helper.TYPE_TIMELINE:
				object = this.parseTimeline( item );
				break;

			case Helper.TYPE_LIBRARY_ITEM:
				object = this.parseTimeline( item.timeline );
				break;

			case Helper.TYPE_INSTANCE:
				object = this.parseTimeline( item.libraryItem.timeline );
				break;
		}

		this.list.push( object );

		return object;
	};


	/** Timeline parsing. */
	prototype.parseTimeline = function(timeline)
	{
		var libraryItem = timeline.libraryItem || { name:"root" };

		var object = { name:libraryItem.name, layers:[] };
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
		
		    object.push( item );
		}

		if( object.length > 0 )
			return object;
		else
			return null;
	};

}(window));