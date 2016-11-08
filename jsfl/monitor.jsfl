(function(window){

	window.Monitor = Monitor;

	var prototype = Monitor.prototype = new Object();
	prototype.constructor = Monitor;


	function Monitor(autoStart)
    {
        autoStart = autoStart !== undefined ? autoStart : true;

        Object.call(this);

        if( autoStart )
            this.start();
    }
    
    prototype.start = function()
    {
        this.timeStart = new Date().getTime();
    }

    prototype.log = function(message)
    {
        this.timeEnd = new Date().getTime();
        this.time = this.timeEnd - this.timeStart;

        flash.trace( this.toString(message) );
    };

    prototype.toString = function(message)
    {
        message = message !== undefined ? message : "";
        return "Monitor.time: " + message + " " + String( this.time ) + "ms";
    }


}(window));