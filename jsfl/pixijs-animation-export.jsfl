(function(window){

	window.Execute = Execute;

	function Execute(){}

	Execute.file = function(name)
	{
		fl.runScript( fl.scriptURI.split( "/" ).slice( 0, -1 ).join( "/" ) + "/" + name );		
	};

}(window));


Execute.file( "helper.jsfl" );
Execute.file( "json-object.jsfl" );
Execute.file( "json-timeline-parser.jsfl" );
Execute.file( "atlas-exporter.jsfl" );

(function(window){

	window.PixiJSAnimationExport = PixiJSAnimationExport;
	var prototype = PixiJSAnimationExport.prototype = new Object();

	function PixiJSAnimationExport(setup)
	{
		Object.call( this );
		this.init();
	}


	/**
	 * Private interface.
	 */

	prototype.init = function()
	{
		this.initJSONTimelineParser();
		this.initAtlasExporter();
	};


	/** JSONTimelineParser. */
	prototype.initJSONTimelineParser = function()
	{
		this.jsonTimelineParser = new JSONTimelineParser(
		{
			timeline: document.getTimeline()
		});

		flash.trace( JSON.encode( this.jsonTimelineParser.data ) );
	};

	prototype.initAtlasExporter = function()
	{
		this.atlasExporter = new AtlasExporter(
		{
			assets: this.jsonTimelineParser.assets
		});
	};

}(window));

var pixiJSAnimationExport = new PixiJSAnimationExport();