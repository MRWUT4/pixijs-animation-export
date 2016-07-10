(function(window){

	window.JSONTimelineParser = JSONTimelineParser;

	var prototype = JSONTimelineParser.prototype = new Object();
	prototype.constructor = JSONTimelineParser;


	function JSONTimelineParser(setup)
	{
		Object.call( this );

		this.timeline = setup.timeline;

		this.init();
	}


	/**
	 * Private interface.
	 */

	prototype.init = function()
	{
		flash.trace( this.timeline );
		// flash.trace( "JSONTimelineParser" );
	};

}(window));