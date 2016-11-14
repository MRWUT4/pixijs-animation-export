(function(window){

	window.aape = window.aape || {};
	window.aape.Sprite = Sprite;

	var prototype = Sprite.prototype = Object.create( PIXI.Sprite.prototype );
	prototype.constructor = Sprite;

	/**
	 * Extended PIXI.Sprite object.
	 *
	 * @class Sprite
	 * @module aape
	 * @extends PIXI.Sprite
	 * @constructor
	 *
	 * @param {Array} textures List of PIXI.Texture objects.
	 * @param {Object} animations Object with format { String:{ begin:Number, end:Number }, ... } .
	 */
	function Sprite(texture)
	{
		PIXI.Sprite.call( this, texture );
	}

	/**
	 * Creates copy of the original object. 
	 * @public
	 * @method clone
	 * @return {aape.Sprite} aape.Sprite object.
	 */
	prototype.clone = function(deepCopy)
	{
		deepCopy = deepCopy !== undefined ? deepCopy : false;
		// var texture = this.texture;

		var clone = null;

		if( deepCopy)
		{
			var baseTexture = this.texture.baseTexture;
			var frame = this.texture.frame.clone();
			var crop = this.texture.crop.clone();
			var trim = this.texture.trim.clone();
			var texture = new PIXI.Texture( baseTexture, frame, crop, trim )
			
			clone = new aape.Sprite( texture );
		}
		else
			clone = new aape.Sprite( this.texture );


		return clone;
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