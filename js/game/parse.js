(function(window){

	window.Parse = Parse;

	var prototype = Parse.prototype = Object.create( Object.prototype );
	prototype.constructor = Parse;


	function Parse(object)
	{		
		Parse.core =
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
			},

			forEach: function(callback)
			{
				for( var property in object )
				{
					var value = object[ property ];
					callback( property, value );
				}
			},

			reduce: function(callback, result)
			{
				for( var property in object )
				{
					var value = object[ property ];
					result = callback( property, value, result );
				}

				return result;
			},

			clone: function()
			{
				var parse = function(element, item)
				{
					for( var property in element )
					{
						var value = element[ property ];

						if( value instanceof Array )
							item[ property ] = parse( value, [] );
						else
						if( typeof value == "object" )
							item[ property ] = parse( value, {} );
						else
							item[ property ] = value;
					}

					return item;
				};

				var item = parse( object, {} );

				return item;
			}
		}

		return Parse.core;
	}

}(window));