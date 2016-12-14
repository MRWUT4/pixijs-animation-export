(function(window){

	window.aape = window.aape || {};
	window.aape.MovieClip = MovieClip;

	var prototype = MovieClip.prototype = Object.create( PIXI.extras.AnimatedSprite.prototype );
	prototype.constructor = MovieClip;

	/**
	 * Extended PIXI.extras.MovieClip object.
	 *
	 * @class MovieClip
	 * @module aape
	 * @extends PIXI.extras.MovieClip
	 * @constructor
	 *
	 * @param {Array} textures List of PIXI.Texture objects.
	 * @param {Object} animations Object with format { String:{ begin:Number, end:Number }, ... } .
	 */

	MovieClip.ANIMATION_SPEED = 1;

	function MovieClip(textures, animations, comments)
	{
		PIXI.extras.AnimatedSprite.call( this, textures, animations );

		this.animationDictionary = animations || {};
		this.comments = comments || null;
		this.onAnimationComplete = null;
		this.isPlaying = true;

		this.setAnimation( 0 );
	}


	/**
	 * Getter / Setter
	 */

	Object.defineProperty( prototype, "stage", 
	{
		get: function() 
		{	
			// this._stage = this._stage !== undefined ? this._stage : null;
			return this.parent;
		}
	});

	Object.defineProperty( prototype, "totalAnimationFrames", 
	{
		get: function() 
		{	
			return ( this.endFrame - 1 ) - this.beginFrame;
		}
	});

	Object.defineProperty( prototype, "labels", 
	{
		get: function() 
		{	
			if( !this._labels )
			{
				this._labels = [];

				for( var property in this.animationDictionary )
					this.labels.push( property );
			}

			return this._labels;
		}
	});

	Object.defineProperty( prototype, "currentLabel", 
	{
		get: function() 
		{	
			return this.getLabelAtFrame( this.beginFrame );
		}
	});

	Object.defineProperty( prototype, "currentFrameIndexLabel", 
	{
		get: function() 
		{	
			return this.getLabelAtFrame( this.currentFrameIndex );
		}
	});

	Object.defineProperty( prototype, "currentLabelObject", 
	{
		get: function() 
		{	
			return this.animationDictionary[ this.getLabelAtFrame( this.beginFrame ) ];
		}
	});

	Object.defineProperty( prototype, "currentFrameIndex", 
	{
		get: function() 
		{	
			var begin = this.currentLabelObject ? this.currentLabelObject.begin : 0;
			return Math.floor( begin + this._currentTime );
		}
	});

	prototype.getFrameNumber = function(label, frameNumber)
	{
		return typeof label == "number" ? label : (frameNumber || 0);
	};

	prototype.getLabelAtFrame = function(frame)
	{
		for( var property in this.animationDictionary )
		{
			var value = this.animationDictionary[ property ];

			if( frame >= value.begin && frame <= value.end )
				return property;
		}
	};

	// Object.defineProperty( prototype, "_currentTimeIndex", 
	// {
	// 	get: function() 
	// 	{	
	// 		var begin = this.currentLabelObject ? this.currentLabelObject.begin : 0;
	// 		return begin + this._currentTime;
	// 	}
	// });


	/** MovieClip gotoAndPlay override function to support multiple animations. */
	prototype.gotoAndPlayMovieClip = prototype.gotoAndPlay;
	prototype.gotoAndPlay = function(label, frameNumber, loop)
	{
		frameNumber = this.getFrameNumber( label, frameNumber );

		this._currentTime = frameNumber;

		this.setAnimation( label, loop );
		this.gotoAndPlayMovieClip( frameNumber );
	};


	/** MovieClip gotoAndStop override function to support multiple animations. */
	prototype.gotoAndStopMovieClip = prototype.gotoAndStop;
	prototype.gotoAndStop = function(label, frameNumber)
	{
		frameNumber = this.getFrameNumber( label, frameNumber );
	
		this.stop();	
		this.setAnimation( label );

	    this.isPlaying = false;
		
	    this.setFrame( frameNumber );
	};

	prototype.setFrame = function(frameNumber)
	{
		this._currentTime = frameNumber;

	    var round = Math.floor( this._currentTime );
	    this._texture = this._textures[ this.getAnimationFrameIndex( round ) % this._textures.length ];
	};


	/** MovieClip updateTransform override function to support multiple animations. */
	prototype.update = function(deltaTime)
	{
	    this._currentTime += this.animationSpeed * deltaTime * MovieClip.ANIMATION_SPEED;


	    var floor = Math.floor( this._currentTime );
	    var index = null;

	    if( floor < 0 )
	    {
	        if( this.loop )
	        {
	   			var frameIndex = this.getAnimationFrameIndex( ( this._textures.length - 1 + floor ) % this._textures.length );
	            this._texture = this._textures[ frameIndex ];
	        }
	        else
	        {
	            if( this.onComplete )
	                this.onComplete( this );
	        }
	    }
	    else 
	    if( this.loop || floor < this.endFrame - this.beginFrame )
	    {
	    	index = this.getAnimationFrameIndex( floor ) % this._textures.length;
	        this._texture = this._textures[ index ];

			// animation complete handler.
			if( this.onAnimationComplete && index == this.endFrame - 1 )
	    		this.onAnimationComplete( this );
	    }
	    else 
	    if( floor >= this.endFrame )
	    {
	        // this.gotoAndStop( this.textures.length - 1 );
	        // this.gotoAndStop( this.currentLabelObject.end - 1);

	        if( this.onComplete )
	            this.onComplete( this );
	    }
	};


	/**
	 * Creates copy of the original object. 
	 * @public
	 * @method clone
	 * @return {aape.MovieClip} aape.MovieClip object.
	 */
	prototype.clone = function()
	{
		var clone = new aape.MovieClip( this.textures, this.animationDictionary );
		
		clone.pivot = { x:this.pivot.x, y:this.pivot.y };
		clone.scale = { x:this.scale.x, y:this.scale.y };
		clone.rotation = this.rotation;
		clone.x = this.x;
		clone.y = this.y;

		return clone;
	};


	/** Sets local properties for the selected animation / label. */
	prototype.setAnimation = function(label, loop)
	{
		this.animation = this.animationDictionary[ label ];

		if( this.animation )
			this.animation.loop = loop !== undefined ? true : loop;

		this.beginFrame = this.animation ? this.animation.begin : 0;
		this.endFrame = this.animation ? this.animation.end + 1 : this.textures.length;
	};

	/** Returns the frameIndex for the current animation. */
	prototype.getAnimationFrameIndex = function(index)
	{
		var frameIndex = this.beginFrame;
		frameIndex += index % ( this.endFrame - this.beginFrame );

		// console.log( index, this.endFrame - this.beginFrame );

		return frameIndex;
	};

}(window));