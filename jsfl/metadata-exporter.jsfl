(function(window){

	window.MetadataExporter = MetadataExporter;

	var prototype = MetadataExporter.prototype = new Object();
	prototype.constructor = MetadataExporter;


	function MetadataExporter(setup)
	{
		Object.call( this );

		this.json = setup.json;

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
		this.initMetadataObject();
	};

	prototype.initMetadataObject = function()
	{
		this.meta = this.json.meta;

		this.meta.name = document.name;
		this.meta.frameRate = document.frameRate;
		this.meta.backgroundColor = document.backgroundColor;
		this.meta.size = { width:document.width, height:document.height };
	};


}(window));