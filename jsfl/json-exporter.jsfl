(function(window){

	window.JSONExporter = JSONExporter;

	var prototype = JSONExporter.prototype = new Object();
	prototype.constructor = JSONExporter;


	function JSONExporter(setup)
	{
		Object.call( this );

		this.id = setup.id;
		this.json = setup.json;
		this.path = setup.path;

		this.init();
	}


	/**
	 * Getter / Setter.
	 */


	/**
	 * Private interface.
	 */

	prototype.init = function()
	{	
		this.initSave();
	};

	prototype.initSave = function()
	{
		var outputPanel = flash.outputPanel;

		//*
		outputPanel.clear();
		outputPanel.trace( JSON.encode( this.json ) );
		outputPanel.save( this.path + this.id + ".json", false, false );
		/*/
		outputPanel.trace( JSON.encode( this.json ) );
		//*/
	};


}(window));