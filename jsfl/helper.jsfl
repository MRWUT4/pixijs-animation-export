(function(window){

	window.Helper = Helper;
	var prototype = Helper.prototype = new Object();


	Helper.FLASH_MOVIE_CLIP = "movie clip";
	Helper.FLASH_GRAPHIC = "graphic";
	Helper.FLASH_ELEMENT = "element";

	Helper.TYPE_TIMELINE = "timeline";
	Helper.TYPE_LIBRARY_ITEM = "library item";
	Helper.TYPE_SPRITE = "sprite";
	Helper.TYPE_INSTANCE = "instance";
	Helper.TYPE_TEXT = "text";

	function Helper(){}


	/**
	 * Static interface.
	 */

	Helper.getType = function(object)
	{
		var type = null;

		flash.trace( object );

		if( object instanceof Timeline )
		{
			var libraryItem = object.libraryItem;

			if( libraryItem )
			{
				switch( libraryItem.itemType )
				{
					case Helper.FLASH_MOVIE_CLIP:
						type = Helper.TYPE_TIMELINE;
						break;

					case Helper.FLASH_GRAPHIC:
						type = Helper.TYPE_SPRITE;
						break;
				}
			}
			else
				type = Helper.TYPE_TIMELINE;
		}
		else
		if( object instanceof Element )
		{
			switch( object.elementType )
			{
				case Helper.TYPE_INSTANCE:
					type = Helper.TYPE_INSTANCE;
					break;

				case Helper.TYPE_TEXT:
					type = Helper.TYPE_TEXT;
					break;
			}
		}
		else
		if( object instanceof LibraryItem )
			type = Helper.TYPE_LIBRARY_ITEM;

		return type;
	};

}(window));