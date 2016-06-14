(function(window){

	window.PreloaderState = PreloaderState;

	var prototype = PreloaderState.prototype = Object.create( ModuleState.prototype );
	prototype.constructor = PreloaderState;


	function PreloaderState(setup, settings)
	{
		ModuleState.call( this, setup );

		Assist.setupScopeVariables( this, settings,
		{
			progress: 0,
			names:
			{
				bar: "bar"
			}
		});
	}


	/**
	 * Getter / Setter.
	 */

	prototype.getProgress = function()
	{
		// var loader = this.setup.loader;
		Assist.followProperty( this, "progress", this.setup.loader.progress );
		return this.progress;
	};


	/**
	 * Private interface.
	 */

	prototype.init = function()
	{
		this.list = 
		[
			new GraphicsModule( this.shared, null, this.setup.loaderPreload, Settings.URL_JSON_PRELOADER ),
			new FluidModule( this.shared ),
			new ButtonModule( this.shared ),
			new MaskProgressModule( this.shared, this.names.bar, this.getProgress.bind( this ) )
		];
	};

}(window));