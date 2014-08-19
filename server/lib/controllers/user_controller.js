var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";

// Logging Functionality
var logging = require(LABPROJECT_SERVER_LIBS + "/util/server_log");

// Permissions management
var permissions = require(LABPROJECT_SERVER_LIBS + "/managers/permissions_manager");

// User and group managment
var user_manager = require(LABPROJECT_SERVER_LIBS + "/managers/user_manager");


var Current_User = null;

module.exports = {
	init: function(username, callback){
		user_manager.verify_user(username, function(result){
			if (result.Error) {callback(result); return;}
			
			if (result === true)
				{
					Current_User = username;
					callback(true);
				}else{
					callback({"Error": {"error_message": "INVALID_USER", "error_type": "CONFIG"}});
					return;
				}
		});
	},
	get_user: function(username, callback){
		if (Current_User !== null)
			{
				user_manager.get_user(Current_User, function(result){
					callback(result.to_json());
				});
			}else{
				callback({"Error": {"error_message": "NO_USER_SET", "error_type": "CONFIG"}});
			}
	},
	//add_user: function(username, config, 
};
