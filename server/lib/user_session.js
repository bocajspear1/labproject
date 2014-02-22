var database = require('./database');

module.exports = {
	check: function(username,callback){
		database.findOne('user_session',{username: username},function(results){
			if (results)
				{
					callback(false)
				}else{
					callback(true);
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
}
