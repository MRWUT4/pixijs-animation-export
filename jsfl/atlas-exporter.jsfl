(function(window){

	window.AtlasExporter = AtlasExporter;

	var prototype = AtlasExporter.prototype = new Object();
	prototype.constructor = AtlasExporter;


	AtlasExporter.allowRotate = false;
	AtlasExporter.borderPadding = 0;
	AtlasExporter.shapePadding = 2;
	AtlasExporter.allowTrimming = true;
	AtlasExporter.autoSize = true;
	AtlasExporter.maxSheetWidth = 1024;
	AtlasExporter.maxSheetHeight = 2048;
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
		this.addOriginPixelToLibrary();
		this.copyOriginPixelFrame();
		this.addOriginPixelToSymbols();
		this.paseByMode();
		this.exportResources();
		this.removeLastFrameFromSymbols();
		this.exitDocumentEditMode();
	};


	prototype.addOriginPixelToLibrary = function()
	{
		var type = "graphic";
		var name = "__aape__originpixel";

		var library = document.library;
		var hasOriginPixel = library.itemExists( name );

		if( !hasOriginPixel )
			library.addNewItem( type, name );
		
		library.selectItem( name, true );
		this.originPixel = library.getSelectedItems()[ 0 ];

		if( !hasOriginPixel )
		{
			this.setFillColorIfBlank();
			this.drawRect( this.originPixel.timeline );
		}
	};

	prototype.exitDocumentEditMode = function()
	{
		document.exitEditMode();
	};

	prototype.copyOriginPixelFrame = function()
	{
		var timeline = this.originPixel.timeline;
		timeline.copyFrames( timeline.frameCount - 1 );
	};

	prototype.addOriginPixelToSymbols = function()
	{
		var that = this;
	
		this.symbols.forEach( function(symbol)
		{
			var timeline = symbol.timeline;

			that.addEmptyKeyframeToTimeline( timeline );
			timeline.pasteFrames( timeline.frameCount - 1 );
		});
	};

	prototype.removeLastFrameFromSymbols = function()
	{
		var that = this;
	
		this.symbols.forEach( function(symbol)
		{
			var timeline = symbol.timeline;
			timeline.removeFrames( timeline.frameCount - 1 );
		});
	};


	/** Construct SpriteSheetObjects according to mode. */
	prototype.paseByMode = function(mode)
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

		var addToSpriteSheetExporters = function(symbols, length)
		{
			var spriteSheetExporter = that.getSpriteSheetExporter();
			// that.debugSpriteSheetExporter( spriteSheetExporter );
			// return;

			list.push( spriteSheetExporter );

			for(var i = symbols.length - 1; i >= 0; --i)
			{
			    var symbol = symbols[ i ];
			
				symbolOverflowsExporter = that.addSymbolToExporter( spriteSheetExporter, symbol );

				if( symbolOverflowsExporter )
				{
					var symbolsLengthDidChange = symbols.length != length;

					if( symbolsLengthDidChange )
						return addToSpriteSheetExporters( symbols, symbols.length );
					else
						return alert( "Symbol to big for atlas of size " + AtlasExporter.maxSheetWidth + "x" + AtlasExporter.maxSheetHeight + ": " + symbol.name );
				}
				else
					symbols.splice( i, 1 );
			}
		};

		if( symbols.length > 0 )
			addToSpriteSheetExporters( symbols.concat() );

		return list;
	};


	// prototype.debugSpriteSheetExporter = function(spriteSheetExporter)
	// {
	// 	alert( "jo");

	// 	for( var property in spriteSheetExporter )
	// 	{
	// 		var value = spriteSheetExporter[ property ];
	// 		flash.trace( property + " " + value );
	// 	}
	// };


	// prototype.addNullingRectangleToLastFrame = function(symbol)
	// {
	// 	this.addEmptyKeyframeToTimeline( symbol.timeline );
	// 	this.setFillColorIfBlank();
	// 	this.drawRect();
	// };

	prototype.addEmptyKeyframeToTimeline = function(timeline)
	{
		var frameCount = timeline.frameCount;
		document.library.editItem( timeline.name );

		timeline.insertBlankKeyframe( frameCount );
	};

	prototype.setFillColorIfBlank = function()
	{
		var fill = document.getCustomFill( "toolbar" );
		
		if( fill.color === undefined )
		{
			fill.color = "#000000";
			fill.style = "solid";

			document.setCustomFill( fill );
		}
	};

	prototype.drawRect = function(timeline)
	{
		document.library.editItem( timeline.name );

		var drawingLayer = fl.drawingLayer;

		drawingLayer.beginDraw()
		drawingLayer.beginFrame()
		var path = drawingLayer.newPath();
		path.addPoint( 0, 0 );
		path.addPoint( 1, 0 );
		path.addPoint( 0, 1 );
		path.addPoint( 0, 0 );
		drawingLayer.endFrame()

		var shape = path.makeShape( false, true );
	};


	prototype.removeLastFrame = function(timeline)
	{
		var frameCount = timeline.frameCount;
		timeline.removeFrames( frameCount - 1 );
	};


	prototype.exportResources = function()
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

			list.push( 
			{ 
				img: imageFolder + id + "." + AtlasExporter.exportFormat.format,
				json: imageFolder + id + ".json"
			});
		}

		return list;
	};

}(window));