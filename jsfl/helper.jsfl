(function(window){

	window.Helper = Helper;
	var prototype = Helper.prototype = new Object();

	Helper.TIMELINE = "timeline";
	Helper.MOVIECLIP = "movieclip";
	Helper.ELEMENT = "element";
	Helper.GRAPHIC = "graphic";
	Helper.LIBRARY_ITEM = "library item";
	Helper.SPRITE = "sprite";
	Helper.INSTANCE = "instance";
	Helper.TEXTFIELD = "textfield";
	Helper.TEXT = "text";


	function Helper(){}


	/**
	 * Static interface.
	 */

	Helper.getItemType = function(object)
	{
		var type = null;

		if( object.libraryItem && object.libraryItem.itemType == Helper.GRAPHIC )
			type = Helper.GRAPHIC;
		else
		if( object instanceof Timeline )
			type = Helper.TIMELINE;
		else
		if( object instanceof Element )
		{
			switch( object.elementType )
			{
				case Helper.INSTANCE:
					type = Helper.INSTANCE;
					break;

				case Helper.TEXT:
					type = Helper.TEXT;
					break;
			}
		}
		else
		if( object instanceof LibraryItem )
			type = Helper.LIBRARY_ITEM;
		

		return type;
	};

	Helper.getExportType = function(object)
	{
		
	};

}(window));