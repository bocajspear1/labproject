var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";

// Logging Functionality
var logging = require(LABPROJECT_SERVER_LIBS + "/util/server_log");

// Database functions
var database = require(LABPROJECT_SERVER_LIBS + '/util/database');

module.exports = {
	// Create a new user session
	make_session: function(username, sessionid, socketid, callback){
		database.insert('user_session',{username: username, sessionid: sessionid, socketid: socketid, lab_name: "" },function(result){
			if (result.ERROR)
				{ 
					if (result.ERROR.name == "MongoError" && result.ERROR.code == 11000)
						{
							callback(false);
						}else{
							logging.log(logging.TYPES.CODE_ERROR, result.ERROR);
							callback(false);
						}
				}else{
					// Successfully added session
					callback(true);
				}
		});
	},
	
	get_session: function(username,callback){
		database.findOne('user_session',{username: username},function(results){
			if (results)
				{
					callback(results);
				}else{
					callback(false);
				}
		});
	},
	
	check_exists: function(username, callback){
		database.findOne('user_session',{username: username},function(results){
			if (results)
				{
					callback(true);
				}else{
					callback(false);
				}
			
		});
	},
	check_same: function(username, socketid, callback){
		database.findOne('user_session',{username: username, socketid: socketid },function(results){
			if (results)
				{
					callback(true);
				}else{
					callback(false);
				}
			
		});
	},
	
	update_session: function(username, values, callback){
		database.update('user_session',{username:username}, {$set: values}, true, function(result){
			callback();
		});
	},
	
	change_lab: function(username, lab_name, callback){
		module.exports.update_session(username, {lab_name: lab_name},function(){
			callback();
		});
	},
	
	switch_session: function(username, sessionid, socketid, callback){
		
		database.findOne('user_session',{username: username}, function(results){
			if (results)
				{
					var old_socketid = results.socketid;
					
					module.exports.update_session(username, {sessionid: sessionid, socketid: socketid}, function(){
						callback(old_socketid);
					});
				}else{
					callback(false);
				}
		});
		
	},
	
	remove_lock: function(sessionid,callback){
		
	},
	insert_lock: function(username,sessionid,socketid,callback){
		database.insert('user_session',{username: username, sessionid: sessionid, socketid: socketid},function(){
			callback();
		});
	}
};
