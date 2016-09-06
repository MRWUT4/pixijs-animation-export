(function(window){

	window.AtlasExporter = AtlasExporter;

	var prototype = AtlasExporter.prototype = new Object();
	prototype.constructor = AtlasExporter;


	function AtlasExporter(setup)
	{
		Object.call( this );

		this.assets = setup.assets;

		this.init();
	}



	/**
	 * Getter / Setter.
	 */

	prototype.getSpriteSheetExporter = function(bounds)
	{
		spriteSheetExporter = new SpriteSheetExporter();

		spriteSheetExporter.allowRotate = false;
		spriteSheetExporter.borderPadding = 0;
		spriteSheetExporter.shapePadding = 2;
		spriteSheetExporter.allowTrimming = true;
		spriteSheetExporter.autoSize = true;
		spriteSheetExporter.maxSheetWidth = bounds.width;
		spriteSheetExporter.maxSheetHeight = bounds.height;
		spriteSheetExporter.stackDuplicateFrames = true;
		spriteSheetExporter.layoutFormat = "JSON";
		spriteSheetExporter.algorithm = "maxRects";

		return spriteSheetExporter;
	};

	prototype.getLibraryItemSize = function(libraryItem)
	{
		var timeline = libraryItem.timeline; 
		var length = timeline.frameCount;

		var width = 0;
		var height = 0;

		for (var i = 1; i <= length; i++) 
		{ 
			var rect = timeline.getBounds(i, true); 
			
			if( rect != 0 )
			{
				var w = rect.right - rect.left; 
				var h = rect.bottom - rect.top; 
				
				width += w;
				height += h;
			} 
		}

		return width * height;
	};


	/**
	 * Private interface.
	 */

	prototype.init = function()
	{
		this.parseAssets();
	};

	prototype.parseAssets = function()
	{
		for(var i = 0; i < this.assets.length; ++i)
		{
		    var asset = this.assets[ i ];
		
			flash.trace( asset );
		    // flash.trace( asset.name + " " + this.getLibraryItemSize( asset ) ); 
		}
	};

}(window));