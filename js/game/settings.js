(function(window){

	window.Settings = Settings;

	var prototype = Settings.prototype = new Object();
	prototype.constructor = Settings;


	function Settings(){}

	Settings.URL_JSON_AUDIO = "audio/audio.json";
	Settings.URL_JSON_CONTENT = "img/content.json";
	Settings.URL_JSON_PRELOADER = "img/preloader.json"

	Settings.ID_STATE_PRELOADER= "preloader";
	Settings.ID_STATE_GAME	= "game";

	Settings.PARAMETER_STATE = "state";


}(window));