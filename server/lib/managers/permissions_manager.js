var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";

var database = require(LABPROJECT_SERVER_LIBS + '/util/database');
var user_manager = require(LABPROJECT_SERVER_LIBS + '/managers/user_manager');

var default_permissions = {
	superuser: false,
	create_group: false,
	create_device: false,
	create_lab: false
};

function permissions_object(username)
	{
		var self = this;
		var Private = {
			username: '',
			permissions: default_permissions
		};
		
		// Load data for the permissions object
		self.load = function(callback){
			database.findOne('permissions', {username: Private.username}, function(result){
				if (!result)
					{
						callback({"Error": {"error_message": "PERMISSIONS_DATA_NOT_FOUND", "error_type": "CODE"}});
					}else if(result.Error){
						callback(result);
					}else{
						Private.permissions = result.permissions;
						callback(self);
					}
				
			});
		};
		
		self.save = function(){
			database.update('permissions', {username: Private.username}, {$set: {permissions: Private.permissions}}, false, function(result){
				callback(result);
			});
		};
		
		self.set_permission = function(permission, setting, callback){
			if (Private.permissions[permission])
				{
					if (setting === true || setting === false)
						{
							Private.permissions[permission] = setting;
						}else{
							callback({"Error": {"error_message": "INVALID_PERMISSION_SETTING", "error_type": "CODE"}});
						}
				}else{
					callback({"Error": {"error_message": "INVALID_PERMISSION", "error_type": "CODE"}});
				}
		};
		
		self.can = function(permission){
			if (Private.permissions[permission])
				{
					return Private.permissions[permission];
				}else{
					callback({"Error": {"error_message": "INVALID_PERMISSION", "error_type": "CODE"}});
				}
		};
		
		self.get_permissions = function(callback){
			if (typeof(callback) == "function")
				{
					callback(Private.permissions);
				}else{
					return Private.permissions;
				}
		};
		
		if (!username)
			{
				self = {"Error": {"error_message": "NO_USERNAME_SET", "error_type": "CONFIG"}};
			}else{
				Private.username = username;
			}
	}

module.exports = {
	new_permissions: function(username, callback){
		database.insert('permissions', {username: username, permissions: default_permissions}, function(result){
			if (result.Error) {callback(result); return;}
			
			var p_object = new permissions_object(username);
			p_object.load(callback);
		});
	},
	get_permissions: function(username, callback){

		var p_object = new permissions_object(username);
		p_object.load(callback);

	}
};
