(function(window){

	window.AssetFactory = AssetFactory;

	var prototype = AssetFactory.prototype = Object.create( Object.prototype );
	prototype.constructor = AssetFactory;


	AssetFactory.TIMELINE = "timeline";

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
		var displayObject = this.parse( template );

		return displayObject;
	};

	prototype.parse = function(template)
	{
		console.log( template.type );

		var object = null;

		switch( template.type )
		{
			case AssetFactory.TIMELINE:
				object = this.getTimeline( template );
				break;
		}

		return object;
	};


	/** Timeline functions. */
	prototype.getTimeline = function(template)
	{
		var assets = this.getAssets( template );

		var timeline = new pixijs.Timeline(
		{
			template: template,
			assets: assets
		});		
	};

	prototype.getAssets = function(template)
	{
		var list = [];

		var parse = function(object)
		{
			for( var property in object )
			{
				var value = object[ property ];

				console.log( value );
				// if( value.name !== undefined )
			}
		};

		parse( object );

		return list;
	};

	// prototype.init = function()
	// {
		
	// };



}(window));