// (function(window){

// 	window.Execute = Execute;

// 	function Execute(){}

// 	Execute.file = function(name)
// 	{
// 		fl.runScript( fl.scriptURI.split( "/" ).slice( 0, -1 ).join( "/" ) + "/" + name );		
// 	};

// }(window));


// Execute.file( "helper.jsfl" );
// Execute.file( "json-object.jsfl" );
// Execute.file( "json-timeline-parser.jsfl" );
// Execute.file( "atlas-exporter.jsfl" );
// Execute.file( "frame-label-exporter.jsfl" );
// Execute.file( "json-exporter.jsfl" );

(function(window){

	window.PixiJSAnimationExport = PixiJSAnimationExport;
	var prototype = PixiJSAnimationExport.prototype = new Object();

	function PixiJSAnimationExport(setup)
	{
		Object.call( this );
		this.init();
	}


	/**
	 * Getter / Setter
	 */

	prototype.getUniversalPath = function(path)
	{
		return path.split( "/" ).slice( 0, -1 ).join( "/" ) + "/";
	};


	/**
	 * Private interface.
	 */

	prototype.init = function()
	{
		this.initVariables();
		this.initJSONTimelineParser();
		this.initAtlasExporter();
		this.initFrameLabelExporter();
		this.initJSONExporter();
	};


	/** Variable setup. */
	prototype.initVariables = function()
	{
		this.documentName = document.name.split(".fla")[ 0 ];
		this.documentPath = this.getUniversalPath( document.pathURI );
		this.libraryItem = document.getTimeline().libraryItem;
		this.timelineID = this.libraryItem ? this.libraryItem.name : this.documentName;
		this.atlasID = this.documentName + "-atlas";
	};


	/** JSONTimelineParser. */
	prototype.initJSONTimelineParser = function()
	{
		this.jsonTimelineParser = new JSONTimelineParser(
		{
			timeline: document.getTimeline()
		});

		// this.json = this.jsonTimelineParser.data;
	};


	/** Add symbols to atlas files. */
	prototype.initAtlasExporter = function()
	{
		this.atlasExporter = new AtlasExporter(
		{
			id: this.timelineID,
			path: this.documentPath,
			symbols: this.jsonTimelineParser.symbols,
			json: this.jsonTimelineParser.data
		});
	};


	/** Add frame labels and comments to data. */
	prototype.initFrameLabelExporter = function()
	{
		this.frameLabelExporter = new FrameLabelExporter(
		{
			timelines: this.jsonTimelineParser.timelines,
			json: this.jsonTimelineParser.data
		});
	};


	/** Init File export. */
	prototype.initJSONExporter = function()
	{
		this.jsonExporter = new JSONExporter(
		{
			id: this.timelineID,
			path: this.documentPath,
			json: this.jsonTimelineParser.data
		});
	};

}(window));


var pixiJSAnimationExport = new PixiJSAnimationExport();