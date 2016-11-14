(function(window){

	window.aape = window.aape || {};
	window.aape.EventDispatcher = EventDispatcher;

	var prototype = EventDispatcher.prototype = Object.create( Object.prototype );
	prototype.constructor = EventDispatcher;
	

	function EventDispatcher()
	{
		Object.call(this);
		this.eventLibrary = {};
	}
	

	/** Minimal Interface */
	prototype.on = function(type, callbackFunction, scope)
	{
		this.addEventListener( type, callbackFunction, scope );	
	};

	prototype.off = function(type, callbackFunction, scope)
	{
		this.removeEventListener( type, callbackFunction, scope );
	};

	prototype.send = function(event, currentTarget)
	{
		this.dispatchEvent( event, currentTarget );
	};

	prototype.mute = function()
	{
		this.removeAllEventListeners();
	};
	
	
	/* INTERFACE */
	prototype.addEventListener = function(type, callbackFunction, scope)
	{
		var object = 
		{ 
			type: type, 
			target: this, 
			callbackFunction: callbackFunction,
			scope: scope
		};

		var list = this.getListWithType(type);


		var isInList = this.objectIsInList( list, object );

		if( list.length == 0 || !isInList )
		{
			list.push( object );
			this.eventLibrary[ type ] = list;
		}
	}

	prototype.removeEventListener = function(type, callbackFunction, scope)
	{
		var list = this.getListWithType(type);

		for(var i = list.length - 1; i >= 0; --i)
		{
			var object = list[i];

			var hasCorrectType = object.type == type;
			var hasNoOrMatchingCallback = !callbackFunction || object.callbackFunction == callbackFunction;
			var hasCorrectScope = object.scope == scope;

			if( hasCorrectType && hasNoOrMatchingCallback && hasCorrectScope )
				list.splice( i, 1 );			
		}

		this.eventLibrary[ type ] == list;
	}

	prototype.removeAllEventListeners = function()
	{
		this.eventLibrary = {};
	}

	prototype.dispatchEvent = function(event, currentTarget)
	{
		var list = this.getListWithType( event.type );

		for(var i = list.length - 1; i >= 0; --i)
		{
			var object = list[ i ];

			if( object )
			{
				event.currentTarget = currentTarget || event.target || null;
				event.target = object.target;
				event.callbackFunction = object.callbackFunction;

				if( object.callbackFunction )
				{
					if( object.scope )
						object.callbackFunction.call( object.scope, event );
					else
						object.callbackFunction( event );
				}
				else
					console.log( "Error: callbackFunction for \"" + event.type + "\" event not defined." );
			}
		}
	}


	/* ASSIST */

	prototype.getListWithType = function(type)
	{
		var list = this.eventLibrary[ type ];
		list = list == undefined ? [] : this.eventLibrary[ type ];

		return list;
	}

	prototype.objectIsInList = function(list, object)
	{
		var bool = true;

		for(var i = 0; i < list.length; ++i)
		{
			var listObject = list[i];
			
			if( !this.compareEvents(listObject, object) )
			{
				bool = false;
				break;
			}
		}

		return bool;
	}

	prototype.compareEvents = function(event0, event1)
	{
		var bool = true;

		if( event0 != undefined && event1 != undefined )
		{
			var isIdenticalType = event0.type == event1.type;
			var isIdenticalCallback = event0.callbackFunction == event1.callbackFunction
			var isIdenticalScope = event0.scope == event1.scope;

			if( !isIdenticalType || !isIdenticalCallback || !isIdenticalScope )
				bool = false;
		}

		return bool;
	}

}(window));


(function(window){

	Event.prototype = new Object();
	
	Event.ACTIVE = "active";
	Event.ADD = "add";
	Event.ADDED = "added";
	Event.ANIMATION_END = "animationend";
	Event.AUDIO_COMPLETE = "audioComplete";
	Event.AUDIO_PAUSE = "audioPause";
	Event.AUDIO_PLAY = "audioPlay";
	Event.BLUR = "blur";
	Event.CALL = "call";
	Event.CANVAS_RESIZE = "canvasresize";
	Event.CHANGE = "change";
	Event.CLICK = "click";
	Event.CLOSE = "close";
	Event.CLOSED = "closed";
	Event.COMPLETE = "complete";
	Event.CONNECT = "connnect";
	Event.END = "end";
	Event.ENTER = "enter";
	Event.ERROR = "error";
	Event.EXIT = "exit";
	Event.FAIL = "fail";
	Event.FOCUS = "focus";
	Event.GYRO = "gyro";
	Event.HIDE = "hide";
	Event.HIT = "hit";
	Event.INACTIVE = "inactive";
	Event.INDEX = "index";
	Event.INIT = "init";
	Event.KEY = "key";
	Event.KILL = "kill";
	Event.LOAD = "load";
	Event.LOADED = "loaded";
	Event.LOCK = "lock";
	Event.MESSAGE = "message";
	Event.MOUSE_DOWN = "mousedown";
	Event.MOUSE_MOVE = "mousemove";
	Event.MOUSE_OUT = "mouseout";
	Event.MOUSE_OVER = "mouseover";
	Event.MOUSE_UP = "mouseup";
	Event.MOUSE_UP_OUTSIDE = "mouseupoutside";
	Event.NEXT = "next";
	Event.OPEN = "open";
	Event.PAUSE = "pause";
	Event.PLAY = "play";
	Event.PRESS_DOWN = "pressdown";
	Event.PRESS_MOVE = "pressmove";
	Event.PRESS_UP = "pressup";
	Event.PREVIOUS = "previous";
	Event.PROCESS = "process";
	Event.PROGRESS = "progress";
	Event.READY = "ready";
	Event.REMOVE = "remove";
	Event.REMOVED = "removed";
	Event.RESET = "reset";
	Event.RESIZE = "resize";
	Event.SEND = "send";
	Event.SETUP = "setup";
	Event.SHOW = "show";
	Event.SPAWN = "spawn";
	Event.START = "start";
	Event.STARTED = "started";
	Event.STEP = "step";
	Event.STOP = "stop";
	Event.SUCCESS = "success";
	Event.TOUCH_END = "touchend";
	Event.TOUCH_END_OUTSIDE = "touchendoutside";
	Event.TOUCH_MOVE = "touchmove";
	Event.TOUCH_START = "touchstart";
	Event.UNLOCK = "unlock";
	Event.UPDATE = "update";
	Event.VALIDATE = "validate";

	function Event(type, object)
	{
		this.type = type;
		this.object = object;
		this.callbackFunction = null;
		this.target = null;
		this.currentTarget = null;
	}
	
	window.Event = Event;

}(window));