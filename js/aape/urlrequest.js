(function(window){

	window.doutils = window.doutils || {};
	window.doutils.URLRequest = URLRequest;

	var prototype = URLRequest.prototype = Object.create( doutils.EventDispatcher.prototype );
	prototype.constructor = URLRequest;


	/**
	 * URLRequest
	 *
	 * @class URLRequest
	 * @module doutils
	 * @extends EventDispatcher
	 * @constructor
	 */
	function URLRequest()
	{
		doutils.EventDispatcher.call(this);
		
		this.mimeType = null;
		this.responseType = null;
	}


	Object.defineProperty( prototype, "progress", 
	{
		get: function() 
		{	
			return this._progress || 0;
		},
		set: function(value) 
		{	
			this._progress = value;
		}
	});

	Object.defineProperty( prototype, "data", 
	{
		get: function() 
		{	
			this._data = this._data || this.request.response || this.request.responseText;
			return this._data
		},
		set: function(value) 
		{	
			this._data = value;
		}
	});

	prototype.load = function(url)
	{
		this.url = url;
		URLRequest.getXMLHttpRequestAndCall( this.xmlHttpCallbackHandler.bind(this) );
	};

	prototype.xmlHttpCallbackHandler = function(request)
	{
		this.request = request;

		if( this.request.addEventListener )
		{
			this.request.addEventListener( Event.PROGRESS, this.requestProgressHandler.bind(this) );
			this.request.addEventListener( Event.LOAD, this.requestLoadHandler.bind(this) );	
		}
		else
			this.request.onreadystatechange = this.requestOnReadyStateChangeHandler.bind(this);


		if( this.request.overrideMimeType && this.mimeType )
		{
			this.request.overrideMimeType( this.mimeType );
			this.openAndSendRequest();
		}
		else
		if( this.mimeType == null )
			this.openAndSendRequest();
		else
			this.dispatchEvent( new Event( Event.ERROR ) );
	};

	prototype.openAndSendRequest = function()
	{
		this.request.open( "GET", this.url, true );

		try
		{
			if( this.responseType )
				this.request.responseType = this.responseType;
		}
		catch( error ){}

		this.request.send();
	};

	prototype.requestProgressHandler = function(event)
	{
		this.progress = event.loaded / event.total;
		this.dispatchEvent( new Event( Event.PROGRESS ) );
	};

	prototype.requestLoadHandler = function(event)
	{
		this.progress = 1;

		this.dispatchEvent( new Event( Event.PROGRESS ) );
		this.dispatchEvent( new Event( Event.COMPLETE ) );
	};

	prototype.requestOnReadyStateChangeHandler = function()
	{
		switch( this.request.readyState )
		{
			case 4:
				this.requestLoadHandler( null );
				break;
		}
	};


	URLRequest.getXMLHttpRequestAndCall = function(callback)
	{
		var request = null;

		try
		{
			request = new XMLHttpRequest();
			callback( request );
		}
		catch( error )
		{
			try 
			{ 
				request = new window.ActiveXObject( "Msxml2.XMLHTTP" ); 
				callback( request );
			} 
			catch( error ) 
			{ 
				request = new window.ActiveXObject( "Microsoft.XMLHTTP" ); 
				callback( request );
			}
		}

		return request;
	}

}(window));