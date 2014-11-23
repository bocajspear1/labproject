var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";

// Logging Functionality
var logging = require(LABPROJECT_SERVER_LIBS + "/util/server_log");

// Database functions
var database = require(LABPROJECT_SERVER_LIBS + '/util/database');

var sanitize = require(LABPROJECT_SERVER_LIBS + '/util/sanitize');

var callback_error = require(LABPROJECT_SERVER_LIBS + '/util/error').callback_error;
var error_type = require(LABPROJECT_SERVER_LIBS + '/util/error').error_type;

var uuid = require('node-uuid');

var util = require(LABPROJECT_SERVER_LIBS + '/util/util');

var exec = require('child_process').exec;

var os = require('os');

var switch_util = {
	get_openvswitch_list: function(callback){
		child = exec('ovs-vsctl list-br', function (error, stdout, stderr) {
			if (!error)
				{
					var lines = stdout.split(/\n/);
					
					callback(lines);
					
				}else{
					callback(new callback_error(error_type.CLI_RETURN_ERROR, "Error from running OpenVSwitch command", error, 2));
				}
		});
	},
	register_switch: function(switch_id, is_static, init_size, callback){
		
		if (typeof is_static != "boolean")
			{
				callback(new callback_error(error_type.INVALID_SWITCH_SETTING, "Invalid value of " + is_static + " for is_static"));
				return;
			}
			
		if (isNaN(init_size))
			{
				callback(new callback_error(error_type.INVALID_SWITCH_SETTING, "Invalid value of " + init_size + " for init_size"));
				return;
			}
			
		// Create a new uuid
		var new_uuid = uuid.v1();
		
		// Attempt to insert the device
		database.insert('registered_switches',{"sw_id": switch_id, "is_static": is_static, "port_count": init_size},function(result){
			if (result instanceof callback_error)
				{ 
					// If there is an error, check if it is indicating that the uuid already exists
					if (result.details().name == "MongoError" && result.details().code == 11000)
						{
							switch_util.register_switch(switch_id, callback);
						}else{
							
							callback(result);
							return;
						}
				}else{
					// If clear, return new uuid
					callback(new_uuid);
				}
		});
		
		
		
	},
	valid_switch_port: function(input){
		var switch_interface_regex = /^(fa|eth|gi)[0-9]{1}\/?[1-9][0-9]{0,2}$/;
		
		return switch_interface_regex.test(input);
	},
	valid_host_interface: function(input){
		var host_interfaces = os.networkInterfaces();
		
		if (host_interface.hasOwnProperty(input))
			{
				return true;
			}else{
				return false;
			}
	},
	run_command: function(command, callback){
		child = exec('ovs-vsctl add-br ' + Private.vs_id, function (error, stdout, stderr) {
			if (!error)
				{
					callback({"stdout": stdout, "stderr": stderr});
				}else{
					callback(new callback_error(error_type.CLI_RETURN_ERROR, "Error on command line command", error);
				}
		});
	}
};

function vswitch(sw_id)
	{
		var self = this;
		var Private = {
			sw_id: '',
			ports: [
				// Format: { "port_name": "fa0/1", "interface": "vnet7", "mode" : "access", "vlan" : "1" }
			],
			chassis_id: 0,
			port_count: 8,
			is_static: false,
			port_prefix: "eth",
			state: "off",
			stp: "on"
		};
		
		if (sw_id && util.is_uuid(sw_id))
			{
				Private.sw_id = sw_id;
			}else{
				self = null;
			}
		
		// Load data from database
		self.load = function(callback){
			database.findOne("registered_switches", {"sw_id": Private.sw_id}, function(data){
				if (data !== null){ 
					Private.interfaces = data.interfaces;
					
					callback(self);
					
				}else{
					callback({"Error":{"error_message": "DATA_NOT_FOUND", "message_type": "CONFIG"}});
				}
			});
		};
		
		// Save data to database
		self.save = function(callback){

			save_obj = {
				ports: Private.ports,
				chassis_id: Private.chassis_id,
				port_prefix: Private.port_prefix,
				state: Private.state,
				stp: Private.stp
			};
			
			if (!Private.is_static)
				{
					save_obj.port_count = Private.port_count;
				}
			
			database.update("registered_switches", {"sw_id": Private.sw_id}, {$set: save_obj}, true, function(result){
				callback(result);
			});
			
		};
		
		// Add port configuration, and set if the switch is on
		self.connect_port = function(sw_port, real_port, callback){
			
			port_num = Private.get_port_num(sw_port);
			
			if (!port_num instanceof callback_error)
			{
				if (port_num 
			}else{
				callback(port_num);
			}
				
			if (Private.state == "on")
				{
					Private.configure_port(sw_port, real_port, callback);
				}else{
					callback(true);
				}
		};
		
		self.set_port_mode = function(sw_port, mode, callback){
			if (mode != "trunk" && mode != "access")
				{
					callback(new callback_error(error_type.INVALID_SWITCH_SETTING, "Invalid port mode");
				}
				
			
		};
		
		self.set_vlan = function(sw_port, vlan, callback){
			if (!isNaN(vlan) && vlan >= 1 && vlan <= 4095 && vlan !== null)
			{
				callback(new callback_error(error_type.INVALID_SWITCH_SETTING, "Invalid vlan number");
				return;
			}
		};
		
		self.add_trunk_vlans = function(sw_port, vlan_list, callback){
			
		};
		
		self.remove_trunk_vlans = function(sw_port, vlan_list, callback){
			
		};
		
		Private.configure_port = function(sw_port, callback){
			if (switch_util.valid_host_interface(real_port))
				{
					switch_util.run_command('ovs-vsctl ' + Private.uuid
				}
		};
		
		Private.convert_port_string = function(sw_port){
			var regex = new RegExp(Private.port_prefix + "" + chassis_id + "\/([1-9][0-9]{0,2})"); 
			var result = regex.match(sw_port);
			
			if (result == null && parseInt(result[1]) === NaN)
			{
				return null;
			}else{
				return parseInt(result[1]);
			}
		}
		
		Private.get_port_num = function(sw_port){
			var port_num = null;
			
			if (switch_util.valid_switch_port(sw_port)
				{
					var parse_result = Private.convert_port_string(sw_port);
					if (parse_result !== null)
					{
						port_num = parse_result;
					}
				} else if (!isNaN(sw_port)) {
					port_num = sw_port;
				} else {
					return new callback_error(error_type.INVALID_SWITCH_SETTING, "Invalid port");
				}
			
			// Set limit to 999 ports
			if (port_num >= 1 && port_num <= 999)
			{
				return port_num;
			}else{
				return new callback_error(error_type.INVALID_SWITCH_SETTING, "Invalid port number");
			}
		};
		
		// Configure switchports on actual virtual switch
		Private.configure_interfaces = function(){
			//
			child = exec('ovs-vsctl list-ports ' + Private.sw_id, function (error, stdout, stderr) {
				if (!error)
					{
						var lines = stdout.split(/\n/);
						
					}else{
						callback(new callback_error(error_type.CLI_RETURN_ERROR, "Error from running OpenVSwitch command", error));
					}
			});
			
		};
		
		self.set_port_prefix = function(new_prefix, callback){
			if (new_prefix == "eth" || new_prefix == "fa" || new_prefix == "gi")
				{
					Private.port_prefix = new_prefix;
				}else{
					callback(new callback_error(error_type.INVALID_SWITCH_SETTING, "Invalid value of " + prefix + " for port prefix"));
				}
		};
		
		self.is_static = function(){
			return Private.is_static;
		};
		
		
		self.change_port_count = function(new_count ,callback){
			if (new_count >= 8 && new_count <= 48)
				{
					if (new_count < Private.port_count)
						{
							callback(new callback_error(error_type.INVALID_SWITCH_SETTING, "Cannot make switch smaller than current size"));
						}else{
							Private.port_count = new_count;
						}
				}else{
					callback(new callback_error(error_type.INVALID_SWITCH_SETTING, "Invalid switch size setting"));
				}
		};

		
		
		self.state = {
			start: function(){
				if (util.is_uuid(Private.vs_id))
					{
						child = exec('ovs-vsctl add-br ' + Private.vs_id, function (error, stdout, stderr) {
							if (!error)
								{
									var lines = stdout.split(/\n/);
									
									callback(lines);
									
								}else{
									callback({"Error":{"error_message": error, "message_type": "CONFIG"}});
								}
						});
					}else{
						
					}
				
				
			},
			stop: function(){
				if (util.is_uuid(Private.vs_id))
					{
						child = exec('ovs-vsctl del-br ' + Private.vs_id, function (error, stdout, stderr) {
							if (!error)
								{
									var lines = stdout.split(/\n/);
									
									callback(lines);
									
								}else{
									callback({"Error":{"error_message": error, "message_type": "CONFIG"}});
								}
						});
					}else{
						
					}
			}
		};
		
		self.port = {
			connect: function(port_name, vm_port_name){
				
			},
			set_mode: function(port_name, mode){
				
			},
			set_vlan: function(port_name, vlan_id){
				
			},
			mirror_to: function(port_name, destination_port){
				
			},
			done: function(){
				
			}
		};
		
		self
		
		self.get_switch_info = function(){
			
		};
		
		self.add_port = function(port, interface, callback){
			if (isNaN(port) && switch_util.valid_switch_port(port))
				{
					full_port = port;
				}else if(!isNaN(port){
					full_port = Private.port_prefix + Private.chassis_id + "/" + port;
				}else{
					callback({"Error":{"error_message": "INVALID_SWITCH_PORT_NAME", "message_type": "CONFIG"}});
					return;
				}
				
		};
		
		self.configure_port = function(port, mode, vlan, callback){
			
		};
		
		self.set_interface = function(){
			
			// Format for port, interface and callback
			if (arguments.length == 3 && typeof(arguments[2]) == "function")
				{
				
				
				// Format for port, interface, vlan, callback
				}else if (arguments.length == 4 && !isNaN(arguments[2]) && typeof(arguments[3]) == "function"){
				
				// Format for port, interface, mode, callback
				}else if (arguments.length == 4 && isNaN(arguments[2] && typeof(arguments[3]) == "function")){
					
				// Format for port, interface
				}else if (arguments.length == 4 && isNaN(arguments[2] && !isNaN(arguments[3]) && typeof(arguments[4]) == "function")){
			
			if ( && switch_util.host_interface(vm_interface) )
				{
					Private.interfaces[switch_interface] = vm_interface;
				}else{
					callback();
				}
		};
		
		self.remove = function(callback){
			database.remove("registered_switches", {"sw_id": Private.sw_id}, function(result){
				callback(result);
			});
		};
		
		
	}


module.exports = {
	new_switch: function(new_id, is_static, init_size, callback){
		switch_util.register_switch(new_id, is_static, function(result){
			if (util.is_uuid(result))
				{
					var switch_obj = new vswitch(new_id);
					switch_obj.load(callback);
				}else{
					callback(result);
				}
		});
	},
	get_switch: function(){
		
	},
	remove_switch: function(){
		
	},
};
