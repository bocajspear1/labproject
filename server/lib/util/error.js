var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";

// Logging Functionality
var logging = require(LABPROJECT_SERVER_LIBS + "/util/server_log");

type_list = {
	"ERROR": 0,
	"INVALID_VM_SETTING": 1,
	"INVALID_SWITCH_SETTING": 2,
	"DATABASE_ERROR": 3,
	"LIBVIRT_ERROR": 4,
	"CLI_RETURN_ERROR": 5,
	"PERMISSION_ERROR": 6,
	"INVALID_SETTING": 7,
	"OBJECT_MISCONFIG": 8,
};

function callback_error(type, message, details, priority)
	{
		if (typeof details === 'undefined')
			{
				details = {};
			}
		
		if (typeof priority === 'undefined')
			{
				priority = 4;
			}
		
		var self = this;
		var Private = {
			type: type,
			message: message,
			priority: priority,
			details: details,
			valid_type: function(){
				for (value in type_list)
					{
						if (type_list[value] == Private.type)
							{
								return true;
							}
					}
				return false;
			}
		}
		
		self.message = function(){
			return Private.message;
		};
		
		self.priority = function(){
			return Private.priority;
		};
		
		self.type = function(){
			return Private.type;
		};
		
		self.details = function(){
			return Private.details;
		};
		
		self.log = function(){
			logging.log();
		};
		
		self.type_name = function(){
			for (type in type_list)
				{
					if (type_list[type] == Private.type)
						{
							return type;
						}
				}
		}
		
		// Validate the input values
		
		if (!Private.valid_type())
			{ 
				throw new Error("An error occured while handling an error: Invalid error type");
			}
		
		if (!Private.message || Private.message == "")
			{
				throw new Error("An error occured while handling an error: A message must be set");
			}
			
		if (Private.priority < 1 && Private.priority > 5)
			{
				throw new Error("An error occured while handling an error: Priority must be be 1, 2, 3, 4, or 5");
			}
		
	}

module.exports = {
	callback_error: callback_error,
	error_type: type_list
};

