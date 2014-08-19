var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";

// Database functions
var database = require(LABPROJECT_SERVER_LIBS + '/util/database');

var crypto = require(LABPROJECT_SERVER_LIBS + '/util/crypto');

var group_util = {
	
};

var user_database = {
	get_user_data: function(username,callback){
		database.findOne('users',{username:username},function(result){
			if (result&&result.ERROR)
				{
					callback(result);
				}else{
					if (!result)
						{
							callback({"Error":"USER_NOT_FOUND"});
						}else{
							callback(result);
						}
				}
		});
	},
	verify_user: function(username,callback){
		database.find('users',{username:username},{},function(result){
			if (result&&result.Error)
				{
					callback(result);
				}else{
					if (result.length===0)
						{
							callback(false);
						}else{
							callback(true);
						}
				}
			
		});
	},
	get_user_list: function(callback){
		database.find('users',{},{"fields" : {"username": 1, _id: 0}},function(result){
			return_list = [];
			for (var i = 0; i < result.length; i++)
				{
					return_list.push(result[i].username);
				}
			callback(return_list);
		});
	}
};

var group_database = {
	get_group_data: function(group_name,callback){
		database.findOne('groups', {name:group_name} ,function(result){
			if (result!==null)
				{
					callback(result);
				}else{
					callback(null);
				}
		});
	},
	update_group_data: function(group_name,data,callback){
		database.update('groups', {name:group_name} , data , false, function(result){
			if (result!==null)
				{
					callback(result);
				}else{
					callback(null);
				}
		});
	},
	remove_user_from_all_groups: function(username, callback){
		// Remove a user from all their groups and admin positions
		database.update("groups", {members: {$in: [username]} }, {$pull: { members: username } }, true, function(){
			database.update("groups", {admins: {$in: [username]} }, {$pull: { admins: username } }, true, function(){
				callback(true);
			});
		});
	},
};

function user(username)
{
	var self = this;
	var Private = {
		username: '',
		firstname: '',
		lastname: '',
		email: '',
		groups: ''
	};
	
	if (username)
		{
			Private.username = username;
		}else{
			self = {"Error": {"error_message": "NO_USERNAME_SET", "message_type": "CODE"}};
		}
	
	self.get_full_name = function(){
		return {"firstname": Private.firstname, "lastname": Private.lastname};
	};
	
	self.get_email = function(){
		return Private.email;
	};
	
	self.get_all_info = function(){
		return {"email": self.get_email(), "name": self.get_full_name()};
	};
	
	self.get_username = function(){
		return Private.username;
	};
	
	self.load = function(callback){
		user_database.get_user_data(Private.username,function(data){
			if (data&&data.Error)
				{
					if (data.Error == "USER_NOT_FOUND")
						{
							callback(null);
						}else{
							callback(data);
						}
				}else{
					Private.firstname = data.firstname;
					Private.lastname = data.lastname;
					Private.email = data.email;
					Private.groups = data.groups;
					
					data = null;
					callback(self);
				}
			
		});
	};
	
	self.remove = function(callback){
		database.remove('users',{username: username},function(result){
			group_database.remove_user_from_all_groups(username,function(){
				if (typeof(callback) == "function")
					{
						callback(result);
					}
				self = null;
			});
		});
	};

	self.to_json = function(callback){
		
		var return_json = Private;
		
		if (typeof(callback) == 'function')
			{
				callback(return_json);
			}else{
				return return_json;
			}
	};
}

function group(group_name)
{
	var self = this;
	var Private = {};
	
	if (group_name)
		{
			Private.name = group_name;
		}else{
			self = {"Error": {"error_message": "GROUP_NAME_NOT_SET", "message_type": "CONFIG"}};
		}
	
	Private.update = function(callback){
		group_database.get_group_data(Private.name,function(data){
			if (data !== false)
				{
					Private.admins = data.admins;
					Private.members = data.members;
					callback(self);
				}else{
					callback({"Error": {"error_message": "NO_DATA_FOUND", "message_type": "CONFIG"}});
				}
		});
	};
	
	self.load = function(callback){
		Private.update(callback);
	};
	
	self.get_admins = function(callback){
		callback(Private.admins);
	};
	
	self.add_user = function(username,callback){
		user_database.verify_user(username, function(result){
			if (result === true)
				{
					group_database.update_group_data(Private.name,{ $addToSet: { "members": username}}, function(result){
						Private.update(function(){
							callback(result);
						});
					});
				}else{
					callback({"Error": {"error_message": "USER_DOESNT_EXIST", "message_type": "CONFIG"}});
				}
		});
	};
	
	self.remove_user = function(username,callback){
		user_database.verify_user(username, function(result){
				if (result === true)
				{
					group_database.update_group_data(Private.name,{ $pull: { "members": username}}, function(result){
						Private.update(function(){
							callback(result);
						});
					});
				}else{
					callback({"Error": {"error_message": "USER_DOESNT_EXIST", "message_type": "CONFIG"}});
				}
		});
	};
	
	self.add_group_admin = function(username,callback){
		user_database.verify_user(username, function(result){
			if (result === true)
				{
					group_database.update_group_data(Private.name,{ $addToSet: { "admins": username}}, function(result){
						Private.update(function(){
							callback(result);
						});
					});
				}else{
					callback({"Error": {"error_message": "USER_DOESNT_EXIST", "message_type": "CONFIG"}});
				}
		});
	};
	
	self.remove_group_admin = function(username,callback){
		database.update('groups',{name:group_name},{ $pull: { admins: username } }, true, function(result){
			callback(result);
		});
					
		user_database.verify_user(username, function(result){
			if (result === true)
				{
					group_database.update_group_data(Private.name,{ $addToSet: { "admins": username}}, function(result){
						Private.update(function(){
							callback(result);
						});
					});
				}else{
					callback(false);
				}
		});
	};
	
	self.is_admin = function(username,callback){
		if (Private.admins.indexOf(username)!=-1)
			{
				callback(true);
			}else{
				callback(false);
			}
	};
	
	self.get_members = function(callback){
		callback(Private.members);
	};
	
	self.remove = function(callback){
		database.remove('groups',{name: Private.name},function(result){
			callback(result);
			self = null;
		});
	};
	
}

module.exports = {
	new_user: function(config,callback){
		if (!config.firstname||!config.lastname||!config.username||!config.email||!config.password)
			{
				callback({"Error": {"error_message": "DATA_NOT_SET", "message_type": "CONFIG"}});
			}else{
				// Limit character input
				config.firstname = config.firstname.replace(/[^a-zA-Z\-_]/,"");
				config.lastname = config.lastname.replace(/[^a-zA-Z\-_]/,"");
				config.username = config.username.replace(/[^a-zA-Z\-_]/,"");
				
				var salt = crypto.random_hash();
				var hash = crypto.pbkdf2(config.password,salt);
				if (!hash.Error)
					{
						var new_user = {
							username: config.username,
							firstname: config.firstname,
							lastname: config.lastname,
							hash: hash,
							salt: salt,
							email: config.email,
						};
						
						database.insert('users', new_user, function(result){
							if (result.Error)
								{
									if (result.Error.error_message.name == "MongoError" && result.Error.error_message.code == 11000)
										{
											callback({"Error": {"error_message": "USER_EXISTS", "message_type": "CONFIG"}});
										}else{
											callback(result);
										}
								}else{
									var the_user = new user(new_user.username);
									the_user.load(callback);	
								}
						});
						
					}else{
						callback({"Error": {"error_message": hash.Error.error_message, "message_type": "CRYPTO"}});
					}
				
				
				
			}
	},
	get_user: function(username,callback){
		var the_user = new user(username);
		if (the_user.Error)
			{
				callback(the_user);
			}else{
				the_user.load(callback);
			}
	},
	get_user_membership: function(username, callback){
		database.find('groups', {members: { $in: [username]}} ,{fields: {"_id": false, "name": true}},function(result){
			if (result&&result.length > 0)
				{
					return_array = [];
					
					for (var i = 0; i < result.length; i++)
						{
							return_array.push(result[i].name);
						}
					
					callback(return_array);
				}else{
					callback(null);
				}
		});
	},
	get_user_list: function(callback){
		user_database.get_user_list(callback);
	},
	
	new_group: function(group_name, callback){
		database.insert('groups',{name: group_name, admins: [], members: []},function(result){
			if (result.Error)
					{
						if (result.Error.error_message.name == "MongoError" && result.Error.error_message.code == 11000)
							{
								callback({"Error": {"error_message": "GROUP_EXISTS", "message_type": "CONFIG"}});
							}else{
								callback(result);
							}
					}else{
						var the_group = new group(group_name);
						the_group.load(callback);
					}
		});		
	},
	get_group: function(group_name, callback){
		var the_group = new group(group_name);
		the_group.load(callback);
	},
	
	verify_user: user_database.verify_user,
	
	verify_group: function(group_name,callback){
		database.find('groups',{name: group_name},{},function(result){
			if (result&&result.Error)
				{
					callback(result);
				}else{
					if (result.length===0)
						{
							callback(false);
						}else{
							callback(true);
						}
				}
			
		});
	},

};
