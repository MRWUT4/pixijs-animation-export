(function(window){

	window.pixijs = window.pixijs || {};
	window.pixijs.Timeline = Timeline;

	var prototype = Timeline.prototype = Object.create( PIXI.Container.prototype );
	prototype.constructor = Timeline;


	Timeline.TIMELINE = "timeline";
	Timeline.MOVIECLIP = "movieclip";
	Timeline.SPRITE = "sprite";
	Timeline.TEXT = "text";


	function Timeline(setup)
	{
		PIXI.Container.call( this );

		this.library = setup.library;
		this.results = setup.results;
		this.id = setup.id || "root";

		this.setFrame( 0 );
	}


	/**
	 * Getter / Setter
	 */

	// Object.defineProperty( prototype, "template", 
	// {
	// 	get: function() 
	// 	{	
	// 		// this._template = this._template !== undefined ? this._template : null;
	// 	}
	// });

	prototype.getTemplate = function(id)
	{
		return this.library[ id ];
	};

	// prototype.getTemplate = function(id)
	// {
	// 	return this.library[ id ];
	// };


	/**
	 * Public interface.
	 */

	// prototype.create = function(id)
	// {
	// 	var template = this.getTemplate( id );
	// 	var displayObject = this.parse( id, template );

	// 	return displayObject;
	// };

	prototype.parse = function(id)
	{
		var object = null;
		var template = this.getTemplate( id );

		console.log( id, template );

		switch( template.type )
		{
			case Timeline.TIMELINE:
				object = this.getTimeline( id, template );
				break;

			case Timeline.MOVIECLIP:
				object = this.getMovieClip( id, template );
				break;

			case Timeline.SPRITE:
				break;

			case Timeline.TEXT:
				break;
		}

		return object;
	};


	/** Timeline functions. */
	prototype.getTimeline = function(id, template)
	{
		// timeline creates its own DisplayObjects to simplify object constuction.
		var timeline = new pixijs.Timeline(
		{
			library: this.library,
			results: this.results,
			id: id
		});		
	};

	prototype.setFrame = function(index)
	{
		this.index = index;

		var template = this.getTemplate( this.id );
		var layers = template.layers;

		this.resolveLayers( layers, index );
	};

	prototype.resolveLayers = function(layers, index)
	{
		layers.map( function( layer )
		{
			this.resolveFrames( layer.frames, index );

		}.bind(this) );
	};

	prototype.resolveFrames = function(frames, index)
	{
		var frame = this.resolveKeyFrame( frames, index );
		var elements = frame.elements;

		elements.map( function( element )
		{
			this.parse( element.id );

		}.bind(this) )
	};

	prototype.resolveKeyFrame = function(object, index)
	{
		var previous = null;

		for( var property in object )
		{
			var value = object[ property ];

			if( Number( property ) >= index )
				return previous || value;

			previous = value;
		}
	};



	/** MovieClip functions. */
	prototype.getMovieClip = function(id, template)
	{
		// function MovieClip(textures, animations, comments)
		// console.log( id, template );

		// var textures = 

		// var movieclip = new pixijs.MovieClip( textures, animations, comments );

		// return movieclip;
	};


}(window));