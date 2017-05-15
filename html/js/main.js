(function(window){

	window.Main = Main;

	var prototype = Main.prototype = Object.create( Object.prototype );
	prototype.constructor = Main;


	function Main(object)
	{
		Object.call( this );

		this.fps = object.fps || 60;
		this.inFocus = true;

		this.url = object.url;

		this.init();
	}


	/**
	 * Private interface.
	 */

	prototype.init = function()
	{
		this.initLoader();
		this.initWindowEvents();
		this.initTick();
	};


	/** Load files. */
	prototype.initLoader = function()
	{
		this.loader = new doutils.Loader( { static:false, recursion:-1 } );

		this.loader.on( Event.COMPLETE, this.loaderCompleteHandler, this );
		this.loader.load( this.url );
	};

	prototype.loaderCompleteHandler = function(event)
	{	
		this.results = this.loader.results;

		var manifest = this.getResourceManifest( this.url, this.loader );

		var loader = new doutils.Loader( { static:false, recursion:-1 } );
		loader.on( Event.COMPLETE, function(event)
		{
			var meta = this.loader.getObjectWithID( this.url ).result.meta;

			this.results = this.results.concat( loader.results );
			this.initPixiJS( meta.size.width, meta.size.height );
			this.createTimeline();

		}.bind(this) );


		loader.load( manifest );
	};

	prototype.getResourceManifest = function(url, loader)
	{
		var folder = url.split( "/" ).slice( 0, -1 ).join( "/" ) + "/";

		var json = loader.getObjectWithID( url ).result;
		var resources = json.resources;
		var manifest = [];

		resources.forEach( function(resource)
		{
			aape.Parse( resource ).forEach( function(property, value)
			{
				var path = folder + value.split( "/" ).pop();
				manifest.push( path );
			});
		});

		return manifest;
	};


	/** PixiJS functions. */
	prototype.initPixiJS = function(width, height)
	{
		PIXI.utils.skipHello();

	    this.stage = new PIXI.Container();
	    this.renderer = new PIXI.CanvasRenderer( width, height, { transparent:true } );

	    this.canvas = this.renderer.view;

		document.body.appendChild( this.canvas );
	};


	/** Init reqeust animation frame update tick */
	prototype.initTick = function()
	{	
		setInterval( function()
		{
			if( this.inFocus && this.renderer )
			{
				this.renderer.render( this.stage );
				this.update();
			}
			
		}.bind( this ), 1000 / this.fps );
	};


	prototype.initWindowEvents = function()
	{
		window.addEventListener( Event.BLUR, this.windowOnBlurHandler.bind(this) );
		window.addEventListener( Event.FOCUS, this.windowOnFocusHandler.bind(this) );
	};

	prototype.windowOnBlurHandler = function(event)
	{
		this.inFocus = false;
	};

	prototype.windowOnFocusHandler = function(event)
	{
		this.inFocus = true;		
	};


	prototype.update = function()
	{
		if( this.sunContainer )
			this.sunContainer.rotation += .01;
	};


	/** Scene functions. */
	prototype.createTimeline = function()
	{
		var json = this.loader.getObjectWithID( this.url ).result;
		var timeScale = json.meta.frameRate / this.fps;

		var timeline = new aape.Timeline(
		{
			json: json,
			elements: this.results,
			timeScale: timeScale
		});

		this.stage.addChild( timeline );
	};

}(window));