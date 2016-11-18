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
		// this.initPixiJS();
		this.initWindowEvents();
		this.initTick();
	};


	/** Load files. */
	prototype.initLoader = function()
	{
		this.loader = new doutils.Loader( { static:false } );

		this.loader.addEventListener( Event.COMPLETE, this.loaderCompleteHandler, this );
		this.loader.load( this.url );
	};

	prototype.loaderCompleteHandler = function(event)
	{
		var meta = this.loader.getObjectWithID( this.url ).result.meta;

		this.initPixiJS( meta.size.width, meta.size.height );
		this.createTimeline();
	};


	/** PixiJS functions. */
	prototype.initPixiJS = function(width, height)
	{
		window.PIXI.utils._saidHello = true;

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
				this.renderer.render( this.stage );
			
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


	/** Scene functions. */
	prototype.createTimeline = function()
	{
		var json = this.loader.getObjectWithID( this.url ).result;
		var elements = this.loader.results;
		var timeScale = json.meta.frameRate / this.fps;

		var timeline = new aape.Timeline(
		{
			library: json.library,
			elements: elements,
			timeScale: timeScale,
			// id: "menuContent"
		});

		// var content = timeline.getChildByName( "content" );
		// content.loop = false;

		// var content = timeline.getChildByName( "content" );
		// content.loop = false;

		// timeline.stop();

		this.stage.addChild( timeline );
	};

}(window));