(function(window){
	
	window.Main = Main;

	var prototype = Main.prototype = Object.create( pixijs.Facade.prototype );
	prototype.constructor = Main;


	function Main()
	{	
		pixijs.Facade.call( this, 
		{ 
			proxy: new Proxy(),
			tweenTime: .3,
			forceURLImage: true,
			settings: Settings,
			// urlAudio: Settings.URL_JSON_AUDIO,
			urlContent: Settings.URL_JSON_CONTENT,
			urlPreloader: Settings.URL_JSON_PRELOADER,
			preloaderState: Settings.ID_STATE_PRELOADER,
			preloaderManifest: 
			[ 
				Settings.URL_JSON_PRELOADER
			],
			manifest:
			[
				// Settings.URL_JSON_AUDIO,
				Settings.URL_JSON_CONTENT
			]
		});
	}


	/** Tracking functions. */
	prototype.sendTag = function(tag)
	{
		if(top.AssistToggo)
			top.AssistToggo.sendIVWTag( tag, location );
		else
			console.log("sendIVWTag", tag);
	};


	/** Initializes StateMachine. */
	prototype.initStateMachine = function()
	{
		this.proxy.loader = this.loader;

		this.stateMachine.on( Event.EXIT, this.stateMachineExitHandler, this );
		this.stateMachine.on( Event.ENTER, this.stateMachineEnterHandler, this );

		this.stateMachine.addState( Settings.ID_STATE_PRELOADER, new PreloaderState( this.setup ) );
		this.stateMachine.addState( Settings.ID_STATE_GAME, new GameState( this.setup ) );
	};

	prototype.stateMachineExitHandler = function(event)
	{
		switch( event.currentTarget.id )
		{
			// case Settings.ID_STATE_MENU:
			// 	this.playMusic();
			// 	break;

			case Settings.ID_STATE_GAME:
				
				break;
		}
	};

	prototype.stateMachineEnterHandler = function(event){};
	

	/** Audio functions. */
	prototype.playMusic = function()
	{
		// Jukebox.getInstance().play( { id:"music", loop:true, single:true, volume:.3 } );
	};	


	/** Load complete handler. */
	prototype.loadCompleteHandler = function()
	{
		this.playMusic();
		this.setState( System.getURLParameter( Settings.PARAMETER_STATE ) || Settings.ID_STATE_GAME );
	};

}(window));