var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";

// Logging Functionality
var logging = require(LABPROJECT_SERVER_LIBS + "/util/server_log");

// Database functions
var database = require(LABPROJECT_SERVER_LIBS + '/util/database');



var exec = require('child_process').exec;

var switch_util = {
	get_openvswitch_list: function(callback){
		child = exec('ovs-vsctl list-br', function (error, stdout, stderr) {
			if (!error)
				{
					var lines = stdout.split(/\n/);
					
					callback(lines);
					
				}else{
					callback({"Error":{"error_message": error, "message_type": "CONFIG"}});
				}
		});
	}
};


function vswitch(sw_id)
	{
		var self = this;
		var Private = {
			id: '',
			interfaces: {
				
			},
		};
		
		if (sw_id)
			{
				Private.id = sw_id;
			}else{
				self = null;
			}
		

		self.load = function(){
			
		};
		
		self.save = function(){
			
		};
		
		self.state = {
			start: function(){
				
			},
			stop: function(){
				
			}
		};
		
		self.get_switch_info = function(){
			
		};
		
		self.config_interface = function(interface_number){
			
		};
		
		
		
	}


module.exports = {
	new_switch: function(){
		
	},
	get_switch: function(){
		
	},
	remove_switch: function(){
		
	},
};
