/*
 * JSON
 */

(function(window){

	var prototype = JSON.prototype = new Object();
	prototype.constructor = JSON;


	JSON.OBJECT = "object";
	JSON.NUMBER = "number";
	JSON.STRING = "string";
	JSON.ARRAY = "array";
 	JSON.BOOLEAN = "boolean";

	function JSON(){}


	/**
	 * Decode functions.
	 */

	JSON.decode = function(string)
	{
		var value = JSON.encodeStringValues( string );
		var value = JSON.removeFormat( value );
		var object = JSON.stringToObject( value );

		return object;
	};

	JSON.stringToObject = function(string)
	{
		var type = JSON.getStringType( string );
		var value = null;

		string = decodeURIComponent( string );

		switch( type )
		{
			case JSON.OBJECT:
				value = JSON.parseObject( string );
				break;

			case JSON.ARRAY:
				value = JSON.parseArray( string );
				break;

			case JSON.STRING:
				value = JSON.parseString( string );
				break;

			case JSON.NUMBER:
				value = Number( string );
				break;
		}

		return value;
	};

	JSON.parseObject = function(string)
	{
		var object = {};
		var stringValue = JSON.removeStartAndEnd( string );
		var split = JSON.splitTopElements( stringValue );

		for(var j = 0; j < split.length; ++j)
		{
		    var splitString = split[ j ];
		
		    var splitColon = splitString.split( ":" );
		    var property = splitColon.splice( 0, 1 );
		    var value = splitColon.join( ":" );

		    object[ property ] = JSON.stringToObject( value );
		}

		return object;
	};


	JSON.parseArray = function(string)
	{
		var array = [];
		var stringValue = JSON.removeStartAndEnd( string );
		var split = JSON.splitTopElements( stringValue );

		for(var j = 0; j < split.length; ++j)
		{
		    var splitString = split[ j ];
		    array.push( JSON.stringToObject( splitString ) );
		}

		return array;
	};

	JSON.parseString = function(string)
	{
		return JSON.removeStartAndEnd( string );
	};


	/**
	 * Encode functions.
	 */

	JSON.encode = function(object, format)
	{
		format = format !== undefined ? format : false;

		// var monitorObjectToJSON = new Monitor( true );
		var json = JSON.objectToJSON( object );
		// monitorObjectToJSON.log( "objectToJSON" );

		// var monitorFormat = new Monitor( true );
		if( format )
			json = JSON.format( json );
		// monitorFormat.log( "format" );

		// var monitorDecodeURI = new Monitor( true );
		json = decodeURIComponent( json );
		// monitorDecodeURI.log( "decodeURIComponent" );

		return json;
	};

	JSON.format = function(json)
	{
		json = JSON.formatNewLine( json );
		json = JSON.formatIndent( json );

		return json;
	};

	JSON.objectToJSON = function(object)
	{
		var string = object ? "{" : '"';
		var index = 0;
		var numOfProperties = JSON.numOfProperties( object );

		for( var property in object )
		{
			index++;

			var value = object[ property ];
			var type = JSON.getType( value );
			var end = index < numOfProperties - 1 ? "," : "";

			switch( type )
			{
				case JSON.OBJECT:
					string += JSON.propertyPair( property, JSON.objectToJSON( value ), end );
					break;

				case JSON.ARRAY:
					string += JSON.propertyPair( property, JSON.arrayToJSON( value ), end );
					break;

				case JSON.STRING:
					string += JSON.propertyPair( property, '"' + encodeURIComponent( value ) + '"', end );
					break;

				case JSON.NUMBER:
					string += JSON.propertyPair( property, value, end );
					break;

				case JSON.BOOLEAN:
					string += JSON.propertyPair( property, value, end );
					break;
			}
		}

		string += object ? "}" : '"';

		return string;
	};

	JSON.arrayToJSON = function(array)
	{
		var string = array ? "[" : '"';

		for(var i = 0; i < array.length; ++i)
		{
		    var value = array[ i ];
			var type = JSON.getType( value );
			var split = i < array.length - 1 ? "," : "";

			switch( type )
			{
				case JSON.OBJECT:
					string += JSON.objectToJSON( value ) + split;
					break;

				case JSON.ARRAY:
					string += JSON.arrayToJSON( value ) + split;
					break;

				case JSON.STRING:
					string += '"' + value + '"' + split;
					break;

				case JSON.NUMBER:
					string += value + split;
					break;
			}
		}

		string += array ? "]" : '"';

		return string;
	};


	/**
	 * Format functions.
	 */

	JSON.removeStartAndEnd = function(string)
	{
		return string.slice( 1, string.length - 1 );
	};

	JSON.removeFormat = function(string)
	{
		var value = string;
		value = value.replace( /(\r\n|\n|\r)/gm,"" );
		value = value.split( " " ).join("");
		value = value.split( "\n" ).join("");
		value = value.split( "\t" ).join("");

		return value;
	};

	JSON.formatNewLine = function(json)
	{
		json = json.split(",").join(",\n");

		json = json.split("{").join("\n{\n");
		json = json.split("}").join("\n}");

		json = json.split("[\"").join("[\n\"");

		json = json.split("[").join("\n[");
		json = json.split("]").join("\n]");
		json = json.split("]}").join("]\n}");

		json = json.split(":").join(": ");

		json = json.split("},\n\n{").join("},\n{");
		json = json.split("\n").splice(1).join("\n");

		return json;
	};

	JSON.formatIndent = function(json)
	{
		var list = json.split("\n");

		for(var i = 0; i < list.length; ++i)
		{
		    var line = list[ i ];
		    var string = list.slice( 0, i ).join( "\n" );
			var numIndents = JSON.getNumOfOpeningObjects( string );

		    for(var j = 0; j < numIndents; ++j)
		    	line = "\t" + line;

		   	list[ i ] = line;
		}

		json = list.join("\n");
		json = json.split("\t}").join("}").split("\t]").join("]");

		return json;
	};

	JSON.getNumOfOpeningObjects = function(string)
	{
		var s = "_°$§!";
		var numOpen = string.split( "{" ).join( s ).split( "[" ).join( s ).split( s ).length;
		var numClosed = string.split( "}" ).join( s ).split( "]" ).join( s ).split( s ).length;

		return numOpen - numClosed ;
	};


	JSON.encodeStringValues = function(string)
	{
		var regex = /"([^"]*)"/;

		while( string.match( regex ) != null )
			string = string.replace( regex, JSON.replaceHandler );
		
		return string;
	};

	JSON.replaceHandler = function(p1)
	{
		return encodeURIComponent( p1 );
	};



	/**
	 * Assist functions.
	 */

	JSON.splitTopElements = function(string)
	{
		var split = string.split( "," );

		for(var i = split.length - 2; i >= 0; --i)
		{
		    var current = split[ i ];
			var previous = split[ i + 1 ];
			var nested = JSON.getIsNested( previous );

			if( nested != 0 )
			{
				split[ i ] = current + "," + previous;
				split.splice( i + 1, 1 );
			}
		}

		return split;
	};

	JSON.getIsNested = function(string)
	{
		var countOpen0 = JSON.getCharCount( string, "{" );
		var countClosed0 = JSON.getCharCount( string, "}" );
		var countOpen1 = JSON.getCharCount( string, "[" );
		var countClosed1 = JSON.getCharCount( string, "]" );

		var isNested = countOpen0 - countClosed0 + countOpen1 - countClosed1;

		return isNested;
	};

	JSON.getCharCount = function(string, character)
	{
		return string.split( character ).length - 1;
	};


	JSON.propertyPair = function(type, string, end)
	{
		return '"' + type + '"' + ":" + string + end;
	};

	JSON.getType = function(object)
	{
		if( object instanceof Array ) 
			return JSON.ARRAY;
		else
		if( typeof object == "boolean" )
			return JSON.BOOLEAN;
		else
			return typeof object;
	};

	JSON.getStringType = function(string)
	{
		var character = string.charAt( 0 );

		switch( character )
		{
			case "{":
				return JSON.OBJECT;
				break;

			case "[":
				return JSON.ARRAY;
				break;

			case "\"":
				return JSON.STRING;
				break;

			case "true":
			case "false":
				return JSON.BOOLEAN;
				break;

			default:
				return JSON.NUMBER;
				break;
		}
	};

	JSON.numOfProperties = function(object)
	{
		var num = 0;

		for( var property in object ) 
			num++;
	
		num = num > 0 ? num + 1 : num;

		return num;
	};


	window.JSON = JSON;

}(window));