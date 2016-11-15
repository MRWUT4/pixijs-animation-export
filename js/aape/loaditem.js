(function(window){

	window.doutils = window.doutils || {};
	window.doutils.LoadItem = LoadItem;

	var prototype = LoadItem.prototype = Object.create( doutils.EventDispatcher.prototype );
	prototype.constructor = LoadItem;


	/**
	 * LoadItem
	 *
	 * @class LoadItem
	 * @module doutils
	 * @extends EventDispatcher
	 * @constructor
	 *
	 * @param {Number} recursion
	 */

	LoadItem.TYPE_FILE = "file";

	function LoadItem(recursion)
	{
		doutils.EventDispatcher.call(this);

		this.type = LoadItem.TYPE_FILE;
		this.startRecursion = recursion;
		this.recursion = recursion;
	}


	Object.defineProperty( prototype, "id", 
	{
		get: function() 
		{	
			return this.url;
		}
	});

	Object.defineProperty( prototype, "name", 
	{
		get: function() 
		{	
			return this.id.split( "/" ).slice( -1 ).join().split( "." )[ 0 ];
		}
	});

	Object.defineProperty( prototype, "recurse", 
	{
		get: function() 
		{	
			return this.recursion >= 0 || this.recursion === null;
		}
	});

	Object.defineProperty( prototype, "progress", 
	{
		get: function() 
		{	
			var progress = this.urlRequest ? this.urlRequest.progress : this._progress;
			progress = progress === undefined ? 0 : progress;
			
			return progress;
		},
		set: function(value) 
		{	
			this._progress = value;
		}
	});

	Object.defineProperty( prototype, "result", 
	{
		get: function() 
		{
			return null;
		}
	});

	Object.defineProperty( prototype, "url", 
	{
		get: function() 
		{	
			return this._url;
		},
		set: function(value) 
		{	
			this._url = value;
		}
	});


	prototype.load = function(url)
	{
		this.url = url;
		this.isLoading = true;

		this.urlRequest = new doutils.URLRequest();
		this.urlRequest.addEventListener( Event.PROGRESS, this.urlRequestProgressHandler.bind(this) );
		this.urlRequest.addEventListener( Event.COMPLETE, this.urlRequestCompleteHandler.bind(this) );
		this.urlRequest.load( this.url );
	};

	prototype.urlRequestProgressHandler = function(event)
	{
		this.dispatchEvent( event );
	};

	prototype.urlRequestCompleteHandler = function(event)
	{
		this.decreaseRecursion();
		this.dispatchEvent( event );
	};

	prototype.decreaseRecursion = function()
	{
		if( this.recursion )
			this.recursion--;
	};


}(window));




(function(window){

	window.doutils = window.doutils || {};
	window.doutils.LoadItemJSON = LoadItemJSON;

	var prototype = LoadItemJSON.prototype = Object.create( doutils.LoadItem.prototype );
	prototype.constructor = LoadItemJSON;


	/**
	 * description
	 *
	 * @class LoadItemJSON
	 * @module doutils
	 * @extends EventDispatcher
	 * @constructor
	 */
	LoadItemJSON.TYPE_JSON = "json";
	LoadItemJSON.ERROR_IVALIDJSON = "Invalid JSON file: ";

	function LoadItemJSON(recursion)
	{
		doutils.LoadItem.call( this, recursion );
		this.type = LoadItemJSON.TYPE_JSON;
	}

	prototype.urlRequestCompleteHandler = function(event)
	{
		this.decreaseRecursion();
		
		this.dispatchEvent( new Event( Event.PROCESS ) );
		this.dispatchEvent( event );
	};

	Object.defineProperty( prototype, "result", 
	{
		get: function() 
		{	
			try
			{
				var data = this.urlRequest.data;
				var json = data ? JSON.parse( data ) : null;
			}
			catch( error )
			{
				console.log( LoadItemJSON.ERROR_IVALIDJSON + this.url );
			}

			return json;
		}
	});


}(window));



(function(window){

	window.doutils = window.doutils || {};
	window.doutils.LoadItemImage = LoadItemImage;

	var prototype = LoadItemImage.prototype = Object.create( doutils.LoadItem.prototype );
	prototype.constructor = LoadItemImage;


	/**
	 * description
	 *
	 * @class LoadItemImage
	 * @module doutils
	 * @extends EventDispatcher
	 * @constructor
	 */
	LoadItemImage.TYPE_IMAGE = "image";
	LoadItemImage.TYPE_PNG = "png";
	LoadItemImage.TYPE_JPG = "jpg";
	LoadItemImage.TYPE_GIF = "gif";
	LoadItemImage.MIME_TYPE = "text/plain; charset=x-user-defined";

	function LoadItemImage(recursion, forceURLImage)
	{
		doutils.LoadItem.call( this, recursion );
		this.type = LoadItemImage.TYPE_IMAGE;
		this.forceURLImage = forceURLImage || false;
	}


	Object.defineProperty( prototype, "result", 
	{
		get: function() 
		{	
			return this._result;
		},
		set: function(value) 
		{	
			this._result = value;
		}
	});

	Object.defineProperty( prototype, "recurse", 
	{
		get: function() 
		{	
			return false;
		}
	});

	prototype.load = function(url)
	{
		this.url = url;
		this.isLoading = true;

		var urlSplit = url.split( "." );
		this.suffix = urlSplit[ urlSplit.length - 1 ];


		if( this.forceURLImage )
			this.urlRequestErrorHandler();
		else
		{
			this.urlRequest = new doutils.URLRequest();
			this.urlRequest.mimeType = LoadItemImage.MIME_TYPE;

			this.urlRequest.addEventListener( Event.PROGRESS, this.urlRequestProgressHandler.bind(this) );
			this.urlRequest.addEventListener( Event.COMPLETE, this.urlRequestCompleteHandler.bind(this) );
			this.urlRequest.addEventListener( Event.ERROR, this.urlRequestErrorHandler.bind(this) );
			this.urlRequest.load( url );
		}
	};

	prototype.urlRequestErrorHandler = function(event)
	{
		var image = new Image();

		image.onload = function()
		{
			this.result = image;
			this.progress = 1;

			this.dispatchEvent( new Event( Event.PROCESS ) );
			this.dispatchEvent( new Event( Event.PROGRESS ) );
			this.dispatchEvent( new Event( Event.COMPLETE ) );
			
		}.bind( this );

		image.src = this.url;
	};


	prototype.urlRequestCompleteHandlerLoaderItem = prototype.urlRequestCompleteHandler;
	prototype.urlRequestCompleteHandler = function(event)
	{
		// this.createImageURLObject( event );
		// else
		this.dispatchEvent( new Event( Event.PROCESS ) );
		this.createImageDataObject( event );
	};

	// prototype.createImageURLObject = function(event)
	// {
	// 	var image = new Image();
		
	// 	image.onload = function()
	// 	{
	// 		this.result = image;
	// 		this.dispatchEvent( event );

	// 	}.bind( this );

	// 	image.src = this.url;
	// };

	prototype.createImageDataObject = function(event)
	{
		var dataUTF8 = Base64.encode( this.urlRequest.data );

		var image = new Image();
		
		image.onload = function()
		{
			this.result = image;
			this.dispatchEvent( event );

		}.bind( this );

		image.src = "data:image/" + this.suffix + ";base64," + dataUTF8;
	};


}(window));



(function(window){

	window.doutils = window.doutils || {};
	window.doutils.LoadItemAudio = LoadItemAudio;

	var prototype = LoadItemAudio.prototype = Object.create( doutils.LoadItem.prototype );
	prototype.constructor = LoadItemAudio;


	/**
	 * description
	 *
	 * @class LoadItemAudio
	 * @module doutils
	 * @extends EventDispatcher
	 * @constructor
	 */
	LoadItemAudio.TYPE_AUDIO = "audio";
	LoadItemAudio.TYPE_MP3 = "mp3";
	LoadItemAudio.TYPE_M4A = "m4a";
	LoadItemAudio.TYPE_OGG = "ogg";
	LoadItemAudio.TYPE_WAV = "wav";
	LoadItemAudio.RESPONSE_TYPE = "arraybuffer";
	LoadItemAudio.RESPONSE_TYPE_BLOB = "blob";

	LoadItemAudio.TYPE_LIST = [ "m4a", "mp3", "ogg", "wav" ];

	function LoadItemAudio(recursion)
	{
		doutils.LoadItem.call( this, recursion );
	
		this.type = LoadItemAudio.TYPE_AUDIO;
		this.audioContext = window.Jukebox ? Jukebox.audioContext : null;
		this.ignoreSoundOnMobile = window.Jukebox && Jukebox.getInstance().getIgnoreSoundOnMobile();

		this.loadedDataCallback = this.audioLoadedDataHandler.bind(this);
	}


	Object.defineProperty( prototype, "result", 
	{
		get: function() 
		{	
			return this._result;
		},
		set: function(value) 
		{	
			this._result = value;
		}
	});

	Object.defineProperty( prototype, "recurse", 
	{
		get: function() 
		{	
			return false;
		}
	});


	prototype.load = function(url)
	{
		this.url = url;
		this.isLoading = true;

		var urlSplit = url.split( "." );
		this.suffix = urlSplit[ urlSplit.length - 1 ];

		//*
		if( System.isMobile.any() && this.ignoreSoundOnMobile )
		{
			this.progress = 1;
			this.dispatchEvent( new Event( Event.PROGRESS ) );
			this.dispatchEvent( new Event( Event.COMPLETE ) );
		}
		else
		if( this.audioContext )
			this.loadRequest( url );
		else
			this.loadElement( url );
		//*/
		// if( System.isMobile.any() && this.ignoreSoundOnMobile )
		// this.loadElement( url );
		// else
		// 	this.loadRequest( url );
	};


	/** Load URLRequest */
	prototype.loadRequest = function(url)
	{
		this.urlRequest = new doutils.URLRequest();
		this.urlRequest.responseType = LoadItemAudio.RESPONSE_TYPE;
		// this.urlRequest.responseType = LoadItemAudio.RESPONSE_TYPE_BLOB;

		this.urlRequest.addEventListener( Event.PROGRESS, this.urlRequestProgressHandler.bind(this) );
		this.urlRequest.addEventListener( Event.COMPLETE, this.urlRequestCompleteHandler.bind(this) );

		this.urlRequest.load( url );
	};

	prototype.urlRequestCompleteHandlerLoaderItem = prototype.urlRequestCompleteHandler;
	prototype.urlRequestCompleteHandler = function(event)
	{
		this.audioContext.decodeAudioData( this.urlRequest.data, this.contextOnBufferHandler.bind(this) );
	};

	prototype.contextOnBufferHandler = function(buffer)
	{
		this.result = buffer;
		this.dispatchEvent( new Event( Event.COMPLETE ) );
	}


	/** Load Audio Element */
	prototype.loadElement = function(url)
	{
		this.audio = new Audio();
		this.audio.preload = "auto";
		this.audio.src = url;
		this.audio.load();
		this.audio.pause();

		this.audio.addEventListener( "canplaythrough", this.loadedDataCallback );
		this.audio.addEventListener( "error", this.audioOnErrorHandler.bind( this ) );
	};

	prototype.audioOnErrorHandler = function(event)
	{
		this.audioLoadedDataHandler();
	};

	prototype.audioLoadedDataHandler = function(event)
	{
		this.audio.removeEventListener( "canplaythrough", this.loadedDataCallback );

		this.progress = 1;
		this.dispatchEvent( new Event( Event.PROGRESS ) );

		this.contextOnBufferHandler( this.audio );
	};


}(window));



(function(window){

	window.doutils = window.doutils || {};
	window.doutils.LoadItemJS = LoadItemJS;

	var prototype = LoadItemJS.prototype = Object.create( doutils.LoadItem.prototype );
	prototype.constructor = LoadItemJS;


	/**
	 * description
	 *
	 * @class LoadItemJS
	 * @module doutils
	 * @extends EventDispatcher
	 * @constructor
	 */
	LoadItemJS.TYPE_JS = "js";
	LoadItemJS.TAG_TYPE = "text/javascript";

	function LoadItemJS(recursion)
	{
		doutils.LoadItem.call( this, recursion );
		this.type = LoadItemJS.TYPE_JS;
	}


	Object.defineProperty( prototype, "result", 
	{
		get: function() 
		{	
			return this._result;
		},
		set: function(value) 
		{	
			this._result = value;
		}
	});


	prototype.urlRequestCompleteHandlerLoadItem = prototype.urlRequestCompleteHandler;
	prototype.urlRequestCompleteHandler = function(event)
	{
		this.appendJSFile( this.url );
	};

	prototype.appendJSFile = function(url)
	{
		this.scriptTag = document.createElement("script")
	    this.scriptTag.type = LoadItemJS.TAG_TYPE;


		this.result = { data:this.urlRequest.data };
		this.dispatchEvent( new Event( Event.PROCESS ) );

	    this.scriptTag.text = this.result.data;

		var head = document.getElementsByTagName("head")[ 0 ];
	    head.appendChild( this.scriptTag ); 


		this.dispatchEvent( new Event( Event.PROGRESS ) );
		this.dispatchEvent( new Event( Event.COMPLETE ) );
	};

}(window));