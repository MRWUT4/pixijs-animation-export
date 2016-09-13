(function(window){

	window.FrameLabelExporter = FrameLabelExporter;

	var prototype = FrameLabelExporter.prototype = new Object();
	prototype.constructor = FrameLabelExporter;


	function FrameLabelExporter(setup)
	{
		Object.call( this );

		this.json = setup.json;
		this.timelines = setup.timelines;

		this.init();
	}


	/**
	 * Getter / Setter.
	 */

	prototype.getLabelDurationObject = function(timeline, parseComments)
	{
		parseComments = parseComments !== undefined ? parseComments : false;

		var duration = null;
		var hasAnimations = null;
		var frameCount = timeline.frameCount;
		var durationObject = {};
		var previous = { name:null, begin:null, end:null };

		for(var i = 0; i < frameCount; ++i)
		{
			var objectList = this.getFrameObjects( timeline, i, parseComments );

			for(var j = 0; j < objectList.length; ++j)
			{
			    var object = objectList[ j ];
			
				hasAnimations = hasAnimations || object.name;

				if( i == 0 || ( object.name && previous.name != object.name ) )
				{
					if( previous )
						previous.end = i - 1;

					duration = { begin:i, end:i + 1};
					previous = duration;

					if( object.name )
						durationObject[ object.name ] = duration;
				}

				if( i != 0 && i == frameCount - 1 )
					previous.end = i;
			    
			}
		}

		return hasAnimations ? durationObject : null;
	};

	prototype.getFrameObjects = function(timeline, index, parseComments)
	{
		parseComments = parseComments !== undefined ? parseComments : false;
		
		var list = [];

		for(var i = 0; i < timeline.layers.length; ++i)
		{
		    var layer = timeline.layers[ i ];
			var frame = layer.frames[ index ];

			if( frame )
			{
				var isKeyFrame = frame.startFrame == index;
		    	var name = frame.name;

		    	var isComment = frame.labelType == "comment";

		    	if( ( isComment && parseComments ) || ( !isComment && !parseComments ) )
		    	{
			    	if( name && isKeyFrame )
			    	{
						var object = { index: index, name: name };
				    	list.push( object )
			    	}
		    	}
	    	}
		}

		if( list.length == 0 )
			list.push( {} );

		return list;
	};


	/**
	 * Private interface.
	 */

	prototype.init = function()
	{	
		var list = this.parseList( this.timelines );
	};


	prototype.parseList = function(timelines)
	{
		for(var i = 0; i < timelines.length; ++i)
		{
		    var timeline = timelines[ i ];

		    var labelObject = this.getLabelDurationObject( timeline );
		    var commmentObject = this.getLabelDurationObject( timeline, true );
			var libraryItem = timeline.libraryItem;

			if( libraryItem )
			{
				var name = libraryItem.name;
				var libraryObject = this.json.library[ name ];

				if( libraryObject )
				{
					if( labelObject )
						libraryObject.labels = labelObject;

					if( commmentObject )
						libraryObject.comments = commmentObject;
				}
			}
		}

		return [];
	};


}(window));