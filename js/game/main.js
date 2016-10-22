(function(window){

	window.Main = Main;

	var prototype = Main.prototype = Object.create( Object.prototype );


	function Main(object)
	{
		Object.call( this );

		this.width = object.width;
		this.height = object.height;
		this.fps = object.fps || 24;
		this.inFocus = true;

		this.url = "img/runner.json";

		this.init();
	}


	/**
	 * Private interface.
	 */

	prototype.init = function()
	{
		this.initPixiJS();
		this.initWindowEvents();
		this.initTick();
		this.initFiles();
	};


	/** PixiJS functions. */
	prototype.initPixiJS = function(width, height)
	{
		window.PIXI.utils._saidHello = true;

	    this.stage = new PIXI.Container();
	    this.renderer = new PIXI.CanvasRenderer( this.width, this.height, { transparent:true } );

	    this.canvas = this.renderer.view;

		document.body.appendChild( this.canvas );
	};


	/** Init reqeust animation frame update tick */
	prototype.initTick = function()
	{	
		setInterval( function()
		{
			if( this.inFocus )
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


	/** Load files. */
	prototype.initFiles = function()
	{
		this.loader = new doutils.Loader( { static:false } );

		this.loader.addEventListener( Event.COMPLETE, this.loaderCompleteHandler, this );
		this.loader.load( this.url );
	};

	prototype.loaderCompleteHandler = function(event)
	{
		this.createTimeline();
		// B(t) = (1 - t)^3
		// console.log( this.quadraticBezier( .5, 0, .2, .3, 1 ) );
	};


	/** Scene functions. */
	prototype.createTimeline = function()
	{
		var json = this.loader.getObjectWithID( this.url ).result;
		var elements = this.loader.results;

		var timeline = new pixijs.Timeline(
		{
			library: json.library,
			elements: elements,
			// id: "head"
		});

		// timeline.gotoAndStop( 0 );
		// timeline.gotoAndStop( 14 );
		// timeline.gotoAndStop( 0 );

		this.stage.addChild( timeline );
		// var container = this.timeline.create( "container" );
	};

}(window));