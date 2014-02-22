var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";

var database = require(LABPROJECT_SERVER_LIBS + '/database');
var user_manager = require(LABPROJECT_SERVER_LIBS + '/user_manager');

module.exports = {
	check_permissions: function(uuid,username, callback){
		user_manager.get_user(username, function(result){
			if (result&&result.Error)
				{
					callback(result);
				}else{
					var user_groups = result.groups;
					
					database.findOne('registered_devices',{uuid: uuid}, function(device){
						if (device&&device.Error)
							{
								// We did not get a device
							}else if (device){
								
							}else{
								
							}
					});
				}
		});
	},
	add_vm_permissions: function(uuid, scope, name, action, callback){
		// {group: "GLOBAL", action: "permit"}
		database.update: function
	},
	remove_vm_permission: function(uuid, scope, name, action, callback){
		
	},
	reorder_vm_permission: function(uuid, scope, name, action, position, callback){
		
	}
}
