(function(window){

	window.AssetFactory = AssetFactory;

	var prototype = AssetFactory.prototype = Object.create( Object.prototype );
	prototype.constructor = AssetFactory;


	AssetFactory.TIMELINE = "timeline";
	AssetFactory.MOVIECLIP = "movieclip";
	AssetFactory.SPRITE = "sprite";
	AssetFactory.TEXT = "text";


	function AssetFactory(setup)
	{
		Object.call( this );

		this.json = setup.json;
		this.loader = setup.loader;

		// this.init();
	}


	/**
	 * Getter / Setter
	 */

	prototype.getTemplate = function(id)
	{
		return this.json.library[ id ];
	};


	/**
	 * Public interface.
	 */

	prototype.create = function(id)
	{
		var template = this.getTemplate( id );
		var displayObject = this.parse( id, template );

		return displayObject;
	};

	prototype.parse = function(id, template)
	{
		var object = null;

		switch( template.type )
		{
			case AssetFactory.TIMELINE:
				object = this.getTimeline( id, template );
				break;

			case AssetFactory.MOVIECLIP:
				object = this.getMovieClip( id, template );
				break;

			case AssetFactory.SPRITE:
				break;

			case AssetFactory.TEXT:
				break;
		}

		return object;
	};


	/** Timeline functions. */
	prototype.getTimeline = function(id, template)
	{
		var assets = this.getAssets( template );

		// timeline creates its own DisplayObjects to simplify object constuction.

		var timeline = new pixijs.Timeline(
		{
			template: template,
			loader: loader
		});		
	};


	/** MovieClip functions. */
	prototype.getMovieClip = function(id, template)
	{
		// function MovieClip(textures, animations, comments)

		console.log( id, template );

		// var textures = 

		// var movieclip = new pixijs.MovieClip( textures, animations, comments );

		// return movieclip;
	};


	/** Asset parsing. */
	// prototype.getAssets = function(template)
	// {
	// 	var list = [];
	// 	var ids = this.getAssetIDs( template );

	// 	for(var i = 0; i < ids.length; ++i)
	// 	{
	// 	    var id = ids[ i ];
	// 	    var displayObject = this.create( id );

	// 	    list.push( displayObject );
	// 	}

	// 	return list;
	// };

	// prototype.getAssetIDs = function(template)
	// {
	// 	var list = [];

	// 	var parse = function(object)
	// 	{
	// 		for( var property in object )
	// 		{
	// 			var value = object[ property ];
	// 			var id = value.id;

	// 			if( id !== undefined )
	// 			{
	// 				if( !this.getValueIsInList( list, id ) )
	// 					list.push( id );
	// 			}
	// 			else
	// 			if( typeof value == "object" )
	// 				parse( value );
	// 		}

	// 	}.bind(this);

	// 	parse( template );

	// 	return list;
	// };


	// prototype.getValueIsInList = function(list, value)
	// {
	// 	for(var i = 0; i < list.length; ++i)
	// 	{
	// 	    var object = list[ i ];
		
	// 	    if( object == value )
	// 	    	return object;
	// 	}
	// };


}(window));