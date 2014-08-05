var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";

// Logging Functionality
var logging = require(LABPROJECT_SERVER_LIBS + "/util/server_log");

// Database functions
var database = require(LABPROJECT_SERVER_LIBS + '/util/database');


function vswitch(sw_id)
	{
		var self = this;
		var Private = {};
		
		if (sw_id)
			{
				Private.id = sw_id;
			}else{
				self = null;
			}
		
		self.load = function(){
			
		};
		
		self.get_switch_info = function(){
			
		};
		
		
		
	}


module.exports = {
	create_switch: function(){
		
	},
	get_switch: function(){
		
	},
	remove_switch: function(){
		
	},
};
