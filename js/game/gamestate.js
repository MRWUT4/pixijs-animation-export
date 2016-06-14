(function(window){

	window.GameState = GameState;

	var prototype = GameState.prototype = Object.create( ModuleState.prototype );
	prototype.constructor = GameState;


	function GameState(setup)
	{
		ModuleState.call( this, setup );
		this.proxy = setup.proxy;
	}

	prototype.init = function()
	{
		this.list = 
		[
			new GraphicsModule( this.shared, this.id ),
			new FluidModule( this.shared ),
			new ButtonModule( this.shared )
		];	
	};

}(window));