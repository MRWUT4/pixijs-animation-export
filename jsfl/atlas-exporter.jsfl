(function(window){

	window.AtlasExporter = AtlasExporter;

	var prototype = AtlasExporter.prototype = new Object();
	prototype.constructor = AtlasExporter;


	AtlasExporter.allowRotate = false;
	AtlasExporter.borderPadding = 0;
	AtlasExporter.shapePadding = 2;
	AtlasExporter.allowTrimming = true;
	AtlasExporter.autoSize = true;
	AtlasExporter.maxSheetWidth = 2048;
	AtlasExporter.maxSheetHeight = 1024;
	AtlasExporter.stackDuplicateFrames = true;
	AtlasExporter.layoutFormat = "JSON";
	AtlasExporter.algorithm = "maxRects";

	AtlasExporter.exportFormat = { format:"png", bitDepth:32, backgroundColor:"#00000000" };
	AtlasExporter.imageFolder = "img/";


	function AtlasExporter(setup)
	{
		Object.call( this );

		this.id = setup.id;
		this.path = setup.path;
		this.symbols = setup.symbols;
		this.json = setup.json;

		this.init();
	}


	/**
	 * Getter / Setter.
	 */

	prototype.getSpriteSheetExporter = function()
	{
		spriteSheetExporter = new SpriteSheetExporter();

		spriteSheetExporter.allowRotate = AtlasExporter.allowRotate;
		spriteSheetExporter.borderPadding = AtlasExporter.borderPadding;
		spriteSheetExporter.shapePadding = AtlasExporter.shapePadding;
		spriteSheetExporter.allowTrimming = AtlasExporter.allowTrimming;
		spriteSheetExporter.autoSize = AtlasExporter.autoSize;
		spriteSheetExporter.maxSheetWidth = AtlasExporter.maxSheetWidth;
		spriteSheetExporter.maxSheetHeight = AtlasExporter.maxSheetHeight;
		spriteSheetExporter.stackDuplicateFrames = AtlasExporter.stackDuplicateFrames;
		spriteSheetExporter.layoutFormat = AtlasExporter.layoutFormat;
		spriteSheetExporter.algorithm = AtlasExporter.algorithm;

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

	prototype.getSortedList = function(list)
	{
		var self = this;

		list.sort( function( a, b )
		{
			var sizeA = self.getLibraryItemSize( a );
			var sizeB = self.getLibraryItemSize( b );

			if( sizeA > sizeB )
				return -1;

			if( sizeA < sizeB )
				return 1;
			
			return 0;

		});

		return list;
	};

	prototype.addSymbolToExporter = function(exporter, symbol)
	{
		exporter.addSymbol( symbol );
		var overflowed = exporter.overflowed;

		if( overflowed )
			exporter.removeSymbol( symbol );

		return overflowed ? true : false;
	};


	/**
	 * Private interface.
	 */

	prototype.init = function()
	{
		this.initParsingByMode();
		this.initResourceExport();
	};


	/** Construct SpriteSheetObjects according to mode. */
	prototype.initParsingByMode = function(mode)
	{
		this.symbols = this.getSortedList( this.symbols );
		this.spriteSheetExporters = null;

		switch( mode )
		{
			default:
				this.spriteSheetExporters = this.parseAssetsCombined( this.symbols );
				break;
		}
	};

	prototype.parseAssetsCombined = function(symbols)
	{
		var that = this;
		var list = [];

		var addToSpriteSheetExporters = function(symbols)
		{
			var spriteSheetExporter = that.getSpriteSheetExporter();
			list.push( spriteSheetExporter );

			var symbolOverflowsExporter = false;

			for(var i = 0; i < symbols.length; ++i)
			{
			    var symbol = symbols[ i ];
				symbolOverflowsExporter = that.addSymbolToExporter( spriteSheetExporter, symbol );

				if( symbolOverflowsExporter )
				{
					// avoid infinite recursion with single overflowing symbol.
					if( symbols.length == 1 )
						return;
					else
					{
						addToSpriteSheetExporters( symbols.slice( i ) );
						break;
					}
				}
			}
		};

		addToSpriteSheetExporters( symbols );

		return list;
	};


	prototype.initResourceExport = function()
	{
		this.resources = this.exportSpriteSheets( this.spriteSheetExporters );

		this.json.resources = this.resources;
	};


	/** Export. */
	prototype.exportSpriteSheets = function(spriteSheetExporters)
	{
		var list = [];

		for(var i = 0; i < spriteSheetExporters.length; ++i)
		{
		    var spriteSheetExporter = spriteSheetExporters[ i ];

		    var id = this.id + "-" + i;
		    var name = this.path + id;
  			var imageFolder = AtlasExporter.imageFolder;

  			spriteSheetExporter.exportSpriteSheet( name, AtlasExporter.exportFormat );



  			// flash.trace( spriteSheetExporter );
  			// tracePropertysAndValues( spriteSheetExporter.proto );
  			// flash.trace( "\n\n" );
  			// tracePropertysAndValues( spriteSheetExporter.prototype );


			list.push( 
			{ 
				img: imageFolder + id + "." + AtlasExporter.exportFormat.format,
				json: imageFolder + id + ".json"
			});
		}

		return list;
	};

}(window));

// function tracePropertysAndValues(object)
// {
// 	for( var property in object )
// 	{
// 		var value = object[ property ];

// 		flash.trace( "\n" );
// 		flash.trace( property + " " + value );
// 		flash.trace( typeof value );
// 	}
// }