(function(window){

	window.aape = window.aape || {};
	window.aape.Cache = Cache;

	var prototype = Cache.prototype = Object.create( Object.prototype );
	prototype.constructor = Cache;


	function Cache()
	{
		Object.call( this );
		
		this.object = {};
		this.pool = {};
	}

	/**
	 * Sets object in cache. 
	 * @public
	 * @method setObject
	 * @param {String} id The cache id.
	 * @param {String} name The name of the object being cached.
	 * @param {Object} object The object to cache.
	 */
	prototype.setObject = function(id, name, object)
	{
		this.object[ id ][ name ] = object;
	};

	/**
	 * Returns object from cache. 
	 * @public
	 * @method getObject
	 * @param {String} id The cache id.
	 * @param {String} name The name of the cached object.
	 */
	prototype.getObject = function(id, name, remove)
	{
		remove = remove !== undefined ? remove : false;

		this.object[ id ] = this.object[ id ] || {};
		var object = this.object[ id ][ name ] || null

		if( remove )
			this.removeObject( id, name );

		return object;
	};

	/**
	 * Removes object from cache.
	 * @public
	 * @method getObject
	 * @param {String} id The cache id.
	 * @param {String} name The name of the cached object.
	 */
	prototype.removeObject = function(id, name)
	{
		this.object[ id ][ name ] = null;
	};

	/**
	 * Add objects to pool. 
	 * @public
	 * @method addToPool
	 * @param {String} id The cache id.
	 * @param {String} name The name of the cached object.
	 */
	prototype.addToPool = function(id, object)
	{
		var pool = this.pool[ id ] = this.pool[ id ] || [];
		pool.push( object );
	};

	/**
	 * Get object from pool.
	 * @public
	 * @method getFromPool
	 * @param {String} id The cache id.
	 * @param {String} name The name of the cached object.
	 */
	prototype.getFromPool = function(id)
	{
		var pool = this.pool[ id ];

		if( pool )
			var object = pool.pop();

		this.pool[ id ] = pool;

		return object;
	};

}(window));