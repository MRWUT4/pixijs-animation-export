(function(window){

	window.Parse = Parse;

	var prototype = Parse.prototype = Object.create( Object.prototype );
	prototype.constructor = Parse;


	function Parse(object)
	{		
		Parse.core = Parse.core ||
		{
			filter: function(callback, addProperty)
			{
				addProperty = addProperty !== undefined ? addProperty : false;

				var list = [];

				for( var property in object )
				{
					var value = object[ property ];

					if( callback( property, value ) )
						list.push( addProperty ? property : value );
				}

				return list;
			},

			map: function(callback)
			{	
				var list = [];

				for( var property in object )
				{
					var value = object[ property ];
					list.push( callback( property, value ) );
				}

				return list;
			},

			every: function(callback)
			{
				for( var property in object )
				{
					var value = object[ property ];
					var result = callback( property, value );

					if( result )
						return true;
				}

				return false;
			}
		}

		return Parse.core;
	}

}(window));