(function(window){

	window.aape = window.aape || {};
	window.aape.DisplayObjectContainer = DisplayObjectContainer;
	
	// window.DisplayObjectContainer = DisplayObjectContainer;

	var prototype = DisplayObjectContainer.prototype = Object.create( PIXI.Container.prototype );
	prototype.constructor = DisplayObjectContainer;


	/**
	 * Extended PIXI.Container object.
	 *
	 * @class DisplayObjectContainer
	 * @module aape
	 * @extends PIXI.Container
	 * @constructor
	 */
	function DisplayObjectContainer()
	{
		PIXI.Container.call( this );
	}


	/** Recursively Returns the first child with id. */
	prototype.getChildByID = function(id)
	{
		return this.getChildrenByID( id )[ 0 ];
	};

	/** Recursively Returns all children with id. */
	prototype.getChildrenByID = function(id)
	{
		match = match !== undefined ? match : true;
		return this.getChildrenByPropertyAndValue( "id", id, match );
	};

	/** Recursively Returns the first child with name. */
	prototype.getChildByName = function(name, recursive)
	{
		return this.getChildrenByName( name, false, recursive )[ 0 ];
	};

	/** Recursively Returns all children with name. */
	prototype.getChildrenByName = function(name, match, recursive)
	{
		match = match !== undefined ? match : true;
		return this.getChildrenByPropertyAndValue( "name", name, match, recursive );
	};

	/** Recursively Returns all children with property and value. */
	prototype.getChildrenByPropertyAndValue = function(property, value, match, recursive)
	{
		match = match !== undefined ? match : false;
		recursive = recursive !== undefined ? recursive : true;

		var list = [];
		var children = this.children;

		for(var i = 0; i < children.length; ++i)
		{
		    var displayObject = children[ i ];
		    var displayObjectChildren = displayObject.children;
		    var displayObjectValue = displayObject[ property ];

		    if( displayObjectValue )
		    {
		    	var	hasMatch = match ? displayObjectValue.match( value ) : displayObjectValue == value;

		    	if( hasMatch )
		    		list.push( displayObject );
		    }
		    
		    if( displayObjectChildren.length > 0 && displayObject.getChildrenByPropertyAndValue && recursive )
		    	list = list.concat( displayObject.getChildrenByPropertyAndValue( property, value, match ) );
		}

		return list;
	};


	Object.defineProperty( prototype, "stage", 
	{
		get: function() 
		{	
			if( !this._stage )
			{
				var parent = this.parent;

				while( parent != null )
				{
					parent = parent.parent;
					
					if( parent )
						this._stage = parent;
				}
			}

			return this._stage;
		}
	});

	Object.defineProperty( prototype, "renderer", 
	{
		get: function() 
		{	
			return this.stage.renderer;
		}
	});

}(window));