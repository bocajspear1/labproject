var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";

// Logging Functionality
var logging = require(LABPROJECT_SERVER_LIBS + "/util/server_log");

// Permissions management
var permissions = require(LABPROJECT_SERVER_LIBS + "/managers/permissions_manager");

// User and group managment
var user_manager = require(LABPROJECT_SERVER_LIBS + "/managers/user_manager");



module.exports = {
	new_vm: function(username, config, callback){
		user_manager.verify_user(username, function(result){
			if (result.Error) {callback(result); return;}
			
			if (result === true)
				{
					permissions.get_permissions(username, function(permission_set){
						if (permission_set.Error) {callback(permission_set); return;}
						
						if (permission_set.can('create_device'))
							{
								// Create the device
							}else{
								callback({"Error": {"error_message": "PERMISSION_DENIED", "error_type": "PERMISSION"}});
							}
						
					});
				}else{
					callback({"Error": {"error_message": "INVALID_USERNAME", "error_type": "CONFIG"}});
				}
			
		});
	},
	update_vm: function(uuid, config, callback){
		
	},
	remove_vm: function(uuid, callback){
		
	},
	start_vm: function(uuid, callback){
		
	},
	stop_vm: function(uuid, callback){
		
	}
};
