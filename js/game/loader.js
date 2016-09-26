(function(window){

	window.doutils = window.doutils || {};
	window.doutils.Loader = Loader;

	var prototype = Loader.prototype = Object.create( EventDispatcher.prototype );
	prototype.constructor = Loader;


	/**
	 * Load files
	 *
	 * @class Loader
	 * @module doutils
	 * @extends EventDispatcher
	 * @constructor
	 *
	 * @param {Object} setup Setup object.
	 */
	Loader.POOL = Loader.POOL || [];
	Loader.REGEX_FILE = /([^"]+(?=\.(jpg|gif|png|json|js|wav|mp3|ogg))\.\2)/gm;

	function Loader(setup)
	{
		EventDispatcher.call(this);

		this.setup = setup || {};
		this.recursion = this.setup.recursion || 1;
		this.ignoreRecursionProgressDepth = this.setup.ignoreRecursionProgressDepth || 1;
		this.maxCueSize = this.setup.maxCueSize || 4;
		this.forceURLImage = this.setup.forceURLImage || true;
		this.suffix = this.setup.suffix || "";

		this.numItems = 0;
	}


	/** Static interface. */
	Loader.getNormalizedURL = function(url)
	{
		var split = typeof url == "string" ? url.split("\\").join("/") : "";
		return split;
	};

	Loader.getValueIsURL = function(value)
	{
		return typeof value == "string" ? value.match( Loader.REGEX_FILE ) : false;
	};



	/**
	 * Getter / Setter
	 */

	Object.defineProperty( prototype, "list", 
	{
		get: function() 
		{	
			this._list = this._list || [];
			return this._list;
		}
	});

	Object.defineProperty( prototype, "pool", 
	{
		get: function() 
		{	
			this._pool = this._pool || [];
			return this._pool;
		}
	});


	Object.defineProperty( prototype, "progress", 
	{
		get: function() 
		{	
			var total = 0;
			var numIgnores = 0;
			var length = this.pool.length;

			for(var i = 0; i < length; ++i)
			{
			    var loadItem = this.pool[ i ];

			    if( loadItem.startRecursion !== this.ignoreRecursionProgressDepth )
					total += loadItem.progress;
				else
					numIgnores++;
			}

			var progress = Math.min( 1, total / ( length - numIgnores - 1 ) );
			progress = progress || 0;

			return progress;
		}
	});

	Object.defineProperty( prototype, "ignore", 
	{
		get: function() 
		{	
			return this._ignore || []; 
		},
		set: function(value) 
		{	
			this._ignore = value;
		}
	});

	// prototype.getResult = function(id)
	// {
	// 	return this.getLoadItemsWithID( id )[ 0 ];
	// };

	prototype.getProgress = function()
	{
		return this.progress;
	};

	prototype.getObjectWithID = function(id)
	{
		return this.getLoadItemsWithID( id )[ 0 ];
	};

	prototype.getObjectsWithID = function(id)
	{
		return this.getLoadItemsWithID( id );
	};

	prototype.getLoadItemsWithID = function(id)
	{
		return this.getItemsInArrayWithId( Loader.POOL, id );
	};

	prototype.getItemsInArrayWithId = function(array, id)
	{
		var list = [];

		if( id )
		{
			for(var i = 0; i < array.length; ++i)
			{
			    var loadItem = array[ i ];
				var loadItemURL = this.removeSuffix( Loader.getNormalizedURL( loadItem.id ) );
				var idURL = this.removeSuffix( Loader.getNormalizedURL( id ) );
				// var hasMatch = loadItemURL.match( idURL );
				var hasMatch = loadItemURL == idURL;

			    if( hasMatch )
			    	list.push( loadItem );
			}
		}

		return list;
	};


	/**
	 * Public interface. 
	 */

	prototype.isIgnoredFileType = function(object)
	{
		for(var i = 0; i < this.ignore.length; ++i)
		{
		    var ignored = this.ignore[ i ];

		 	if( object.match( ignored ) )
		 		return true;   
		}

		return false;
	};

	prototype.reset = function()
	{
		this._pool = [];
		this._list = [];
		this._ignore = [];
	};

	prototype.createLoadItem = function(url, recursion)
	{
		var type = url.split( "." )[ 1 ].split( "?" )[ 0 ].split( "#" )[ 0 ];
		var item = null;

		switch( type )
		{
			case doutils.LoadItemJSON.TYPE_JSON:
				item = new doutils.LoadItemJSON( recursion );
				break;

			case doutils.LoadItemImage.TYPE_PNG:
			case doutils.LoadItemImage.TYPE_JPG:
			case doutils.LoadItemImage.TYPE_GIF:
				item = new doutils.LoadItemImage( recursion, this.forceURLImage );
				break;

			case doutils.LoadItemAudio.TYPE_MP3:
			case doutils.LoadItemAudio.TYPE_OGG:
			case doutils.LoadItemAudio.TYPE_WAV:
				item = new doutils.LoadItemAudio( recursion );
				break;

			case doutils.LoadItemJS.TYPE_JS:
				item = new doutils.LoadItemJS( recursion );
				break;
		}

		return item;
	};

	prototype.addSuffix = function(url)
	{
		return this.suffix !== undefined ? url + this.suffix : url;
	};

	prototype.removeSuffix = function(url)
	{
		return url.split( this.suffix ).join( "" );
	};

	prototype.load = function(manifest)
	{
		this.manifest = ( manifest instanceof Array ) ? manifest : [ manifest ];		
		this.loadData( this.manifest, this.recursion );
	};

	prototype.loadArray = function(object, recursion)
	{
		for(var i = 0; i < object.length; ++i)
		{
		    var url = object[ i ];
			this.loadData( url, recursion );
		}

		this.loadNextItem();
	};

	prototype.loadObject = function(object, recursion)
	{
		for( var property in object )
		{
			var value = object[ property ];

			switch( typeof( value ) )
			{
				case "object":
					this.loadObject( value, recursion );
					break;

				case "string":

					// TODO: CreateJS specific code. Remove if possible.
					var splitManifest = value.split( "manifest:" );

					if( splitManifest.length > 1 )
						value = splitManifest[ 1 ].split( "};" )[0];


					var match = Loader.getValueIsURL( value );

					if( match )
						this.loadData( match, recursion );
				
					break;
			}
		}
		
		this.loadNextItem();
	};

	prototype.loadData = function(object, recursion)
	{
		if( object instanceof Array )
			this.loadArray( object, recursion );
		else
		if( object instanceof Object )
			this.loadObject( object, recursion );
		else
		if( object )
		{
			this.numItems++;

			var loadItem = this.createLoadItem( object, recursion );

			if( loadItem /*&& !this.getObjectWithID( object )*/ )
			{
				var ignored = this.isIgnoredFileType( object );

				if( !ignored )
				{
					loadItem.on( Event.PROGRESS, this.loadItemProgressHandler, this );
					loadItem.on( Event.PROCESS, this.loadItemProcessHandler, this );
					loadItem.on( Event.COMPLETE, this.loadItemCompleteHandler, this );

					loadItem.url = Loader.getNormalizedURL( object );
					loadItem.url = this.addSuffix( loadItem.url );

					this.send( new Event( Event.ADD, loadItem ) );

					this.pool.push( loadItem );
					this.list.push( loadItem );
				}
			}
			// else
			// {
			// 	var object = this.getObjectWithID( object );
			// 	this.dispatchLoadAndCompleteEvents( object );
			// }
		}
		else
			this.loadNextItem();
	};

	prototype.loadNextItem = function()
	{
		var size = this.maxCueSize || this.list.length;

		for(var i = 0; i < size; ++i)
		{
			var loadItem = this.list[ i ];
		    
		    if( loadItem && !loadItem.isLoading )
		    	loadItem.load( loadItem.url );
		}
	};


	prototype.loadItemProgressHandler = function(event)
	{
		var loadItem = event.target;
		this.send( new Event( Event.PROGRESS, this.progress ) );
	};

	prototype.loadItemProcessHandler = function(event)
	{
		var loadItem = event.target;
		this.send( new Event( Event.PROCESS, loadItem ) );
	};

	prototype.loadItemCompleteHandler = function(event)
	{
		var loadItem = event.target;

		this.addItemToGlobalPool( loadItem );
		this.recurseLoadResult( loadItem );
		this.removeItemFromArray( this.list, loadItem );
		this.dispatchLoadAndCompleteEvents( loadItem );
		this.loadNextItem();
	};


	prototype.addItemToGlobalPool = function(loadItem)
	{
		if( !this.getObjectWithID( loadItem.id ) )
			Loader.POOL.push( loadItem );
	};

	prototype.recurseLoadResult = function(loadItem)
	{
		if( loadItem.recurse )
			this.loadData( loadItem.result, loadItem.recursion - 1 );
	};


	prototype.removeItemFromArray = function(array, loadItem)
	{
		for(var i = array.length - 1; i >= 0; --i)
		{
			if( array[ i ] == loadItem )
				array.splice( i, 1 );
		}
	};


	prototype.dispatchLoadAndCompleteEvents = function(loadItem)
	{
		this.send( new Event( Event.LOAD, loadItem ) );

		if( this.list.length == 0 )
			this.send( new Event( Event.COMPLETE ) );	
	};

}(window));