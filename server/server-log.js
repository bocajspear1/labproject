// Include classes that allow the cli output to be colored (https://npmjs.org/package/cli-color)
var color = require('cli-color');

module.exports = {
	log_notice : function(message)
		{
			console.log(color.greenBright("\nNOTICE: " + message));
		},
	log_error : function(message)
		{
			console.log(color.redBright("\nERROR: " + message));
		},
	log_startup : function(message)
		{
			console.log(color.cyanBright(message))
		},
	log_debug : function(message)
		{
			console.log(color.blueBright("\nDEBUG: " + message))
		},
	start_file_logging : function(path)
		{
			
		}
	
}
