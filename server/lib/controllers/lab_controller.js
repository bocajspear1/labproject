var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";

// Logging Functionality
var logging = require(LABPROJECT_SERVER_LIBS + "/util/server_log");

// Permissions management
var permissions = require(LABPROJECT_SERVER_LIBS + "/managers/permissions_manager");

// User and group managment
var user_manager = require(LABPROJECT_SERVER_LIBS + "/managers/user_manager");

// Lab managment
var lab_manager = require(LABPROJECT_SERVER_LIBS + "/managers/lab_manager");

var sanitize = require(LABPROJECT_SERVER_LIBS + '/util/sanitize');

var Current_User = '';
var Current_Lab = '';

module.exports = {
	init: function(username, lab, callback){
		user_manager.verify_user(username, function(result){
			if (result.Error) {callback(result); return;}
			
			if (result === true)
				{
					Current_User = username;
					
					if (lab !== null)
						{
							lab_manager.verify_lab(lab, function(lab_result){
								if (lab_result.Error) {callback(lab_result); return;}
								
								if (lab_result === true)
									{
										Current_Lab = lab;
										callback(true);
									}else{
										callback({"Error": {"error_message": "INVALID_LAB", "error_type": "CONFIG"}});
										return;
									}
								
									
							});
						}else{
							callback(true);
						}
					
				}else{
					callback({"Error": {"error_message": "INVALID_USER", "error_type": "CONFIG"}});
					return;
				}
		});
	},
	new_lab: function(lab_name, lab_config, callback){

		if (Current_User !== null)
			{
				permissions.get_permissions(Current_User, function(permission_set){
					if (permission_set.Error) {callback(permission_set); return;}
					
					if (permission_set.can('create_lab'))
						{
							lab_manager.new_lab(lab_name, Current_User, function(new_lab){
								if (new_lab.Error) {callback(permission_set); return;}
								
								if (lab_config.description)
									{
										var clean_input = sanitize.simple_text(lab_config.description);
										new_lab.set_description(clean_input);
									}
								
								new_lab.save(function(){
									callback({"Success": true});
								});
								
							});
							
							
						}else{
							callback({"Error": {"error_message": "PERMISSION_DENIED", "error_type": "PERMISSION"}});
						}
					
				});
			}else{
				callback({"Error": {"error_message": "NO_USER_SET", "error_type": "CONFIG"}});
			}
	},
	delete_lab: function(callback){
		if (Current_User !== null||Current_Lab !== null)
			{
				lab_manager.get_lab(Current_Lab, function(lab_object){
					permissions.get_permissions(Current_User, function(permission_set){
						if (permission_set.Error) {callback(permission_set); return;}
						
						if (permission_set.can('superuser')||lab_object.get_owner==Current_User)
							{
								lab_object.remove(function(result){
									callback({"Success": true});
								});
								

							}else{
								callback({"Error": {"error_message": "PERMISSION_DENIED", "error_type": "PERMISSION"}});
							}
						
					});
				});
			}else{
				callback({"Error": {"error_message": "NO_USER_OR_LAB_SET", "error_type": "CONFIG"}});
			}
	},
	update_lab_info: function(config_data, callback){
		if (Current_User !== null||Current_Lab !== null)
			{
				lab_manager.get_lab(Current_Lab, function(lab_object){
					permissions.get_permissions(Current_User, function(permission_set){
						if (permission_set.Error) {callback(permission_set); return;}
						
						if (permission_set.can('superuser')||lab_object.get_owner==Current_User)
							{
								// Make edits to lab
								
								
								
								

							}else{
								callback({"Error": {"error_message": "PERMISSION_DENIED", "error_type": "PERMISSION"}});
							}
						
					});
				});
			}else{
				callback({"Error": {"error_message": "NO_USER_OR_LAB_SET", "error_type": "CONFIG"}});
			}
	},
	add_share_for: function(name, type, share_permissions, callback){
		if (Current_User !== null||Current_Lab !== null)
			{
				lab_manager.get_lab(Current_Lab, function(lab_object){
					permissions.get_permissions(Current_User, function(permission_set){
						if (permission_set.Error) {callback(permission_set); return;}
						
						if (permission_set.can('superuser')||lab_object.get_owner==Current_User)
							{
								// Make edits to lab
								
								lab_object.create_share(function(share_object){
									
									
									
									
									
								});
								
								
								

							}else{
								callback({"Error": {"error_message": "PERMISSION_DENIED", "error_type": "PERMISSION"}});
							}
						
					});
				});
			}else{
				callback({"Error": {"error_message": "NO_USER_OR_LAB_SET", "error_type": "CONFIG"}});
			}
	},
	create_save_point: function(callback){
		
	},
	add_device: function(uuid, callback){
		
	},
	remove_device: function(uuid, callback){
		
	},
};
