(function(window){

	window.Proxy = Proxy;

	var prototype = Proxy.prototype = Object.create( Object.prototype );
	prototype.constructor = Proxy;


	function Proxy(setup)
	{
		Object.call(this);
		this.reset();
	}

	prototype.reset = function()
	{
		this._property = null;
	};


	/**
	 * System.
	 */
	Object.defineProperty( prototype, "property", 
	{
		get: function() 
		{	
			return this._property;
		},
		set: function(value) 
		{	
			this._property = value;
		}
	});


}(window));

