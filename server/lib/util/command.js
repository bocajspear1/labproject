var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";

var sanitize = require(LABPROJECT_SERVER_LIBS + '/util/sanitize');

var callback_error = require(LABPROJECT_SERVER_LIBS + '/util/error').callback_error;
var error_type = require(LABPROJECT_SERVER_LIBS + '/util/error').error_type;

var exec = require('child_process').exec;

module.exports = {
	run: function(command, param, callback){
		command = sanitize.path(command);
		if (param instanceof Array)
			{
				
				if (command.trim() === "")
					{
						callback(new callback_error(error_type.INVALID_INPUT, "Command cannot be blank")); 
						return;
					}
				
				command_string = command;
				
				for (var i in param)
					{
						command_string += " " + sanitize.parameter(param[i]);
					}
				
				child = exec(command_string, function (error, stdout, stderr) {
					if (!error)
						{
							var stdout_lines = stdout.split(/\n/);
							var stderr_lines = stderr.split(/\n/);
							
							for (var i in stdout_lines)
								{
									stdout_lines[i] = stdout_lines[i].trim();
								}
							
							for (var j in stderr_lines)
								{
									stdout_lines[j] = stdout_lines[j].trim();
								}
							
							callback(stdout_lines, stderr_lines);
						}else{
							callback(new callback_error(error_type.CLI_RETURN_ERROR, "Error from running command", error, 2), null);
						}
				});
				
			}else{
				callback(new callback_error(error_type.INVALID_INPUT, "parameters should be an array"), null);
			}
		
	}
};
