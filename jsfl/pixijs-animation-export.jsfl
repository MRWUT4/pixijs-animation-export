(function(window){

	window.Execute = Execute;

	function Execute(){}

	Execute.file = function(name)
	{
		fl.runScript( fl.scriptURI.split( "/" ).slice( 0, -1 ).join( "/" ) + "/" + name );		
	};

}(window));



Execute.file( "json-timeline-parser.jsfl" );

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
	};


	/** JSONTimelineParser. */
	prototype.initJSONTimelineParser = function()
	{
		this.jsonTimelineParser = new JSONTimelineParser(
		{
			timeline: document.getTimeline()
		});
	};

}(window));

var pixiJSAnimationExport = new PixiJSAnimationExport();