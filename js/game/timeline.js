(function(window){

	window.pixijs = window.pixijs || {};
	window.pixijs.Timeline = Timeline;

	var prototype = Timeline.prototype = Object.create( PIXI.Container.prototype );
	prototype.constructor = Timeline;


	function Timeline(setup)
	{
		PIXI.Container.call( this );

		this.template = setup.template;

		this.init();
	}


	/**
	 * Private interface.
	 */

	prototype.init = function()
	{
		
	};

}(window));