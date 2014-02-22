var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";

// Database functions
var database = require(LABPROJECT_SERVER_LIBS + '/database');

var crypto = require(LABPROJECT_SERVER_LIBS + '/cryptojs');

module.exports = {
	new_user: function(config,callback){
		if (!config.firstname||!config.lastname||!config.username||!config.email||!config.password)
			{
				callback({"Error":"Not all data set"});
			}else{
				// Limit character input
				config.firstname = config.firstname.replace(/[^a-zA-Z\-_]/,"");
				config.lastname = config.lastname.replace(/[^a-zA-Z\-_]/,"");
				config.username = config.username.replace(/[^a-zA-Z\-_]/,"");
				
				var salt = crypto.random_hash();
				var hash = crypto.pbkdf2(config.password,salt);
				if (hash !== false)
					{
						var new_user = {
							username: config.username,
							firstname: config.firstname,
							lastname: config.lastname,
							hash: hash,
							salt: salt,
							email: config.email,
							groups: ['GLOBAL']
						};
						
						database.insert('users', new_user, function(result){
							callback(result);
						});
						
					}else{
						callback(false)
					}
				
				
				
			}
	},
	get_user: function(username,callback){
		database.findOne('users',{username:username},function(result){
			if (result&&result.Error)
				{
					callback(result);
				}else{
					if (!result)
						{
							callback({"Error":"No User found"});
						}else{
							callback(result);
						}
				}
		});
	},
	delete_user: function(username,callback){
		database.remove('users',{username: username},function(result){
			callback(result);
		});
	},
	verify_user: function(username,callback){
		database.find('users',{username:username},{},function(result){
			if (result&&result.Error)
				{
					callback(result);
				}else{
					if (result.length==0)
						{
							callback(false);
						}else{
							callback(true);
						}
				}
			
		});
	},
	new_group: function(group_name, callback){
		database.insert('groups',{name: group_name, admins: []},function(result){
				callback();
		});		
	},
	delete_group: function(group_name, callback){
		database.remove('groups',{name: group_name},function(result){
			callback(result);
		});
	},
	verify_group: function(group_name,callback){
		database.find('groups',{name: group_name},{},function(result){
			if (result&&result.Error)
				{
					callback(result);
				}else{
					if (result.length==0)
						{
							callback(false);
						}else{
							callback(true);
						}
				}
			
		});
	},
	get_group: function(group_name, callback){
		
	},
	add_user_to_group: function(username,group_name,callback){
		module.exports.verify_group(group_name, function(result){
			if (result===true)
				{
					database.update('users',{username:username},{ $addToSet: { groups: group_name } },function(result){
						callback(result);
					});
				}else{
					
				}
		});
		
	},
	remove_user_from_group: function(username,group_name,callback){
		module.exports.verify_group(group_name, function(result){
			if (result===true)
				{
					database.update('users',{username:username},{ $pull: { groups: group_name } },function(result){
						callback(result);
					});
				}else{
					
				}
		});
	},
	add_group_admin: function(username,group_name,callback){
		
	},
	is_group_admin: function(username,group_name,callback){
		
	},
	can_add_users: function(){
		
	}
}
