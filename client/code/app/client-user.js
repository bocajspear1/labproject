var authentication = require('./client-auth')

module.exports = {
	get_user_info: function(username, callback){
		ss.rpc("users.get_user_info", username, function(info){
			authentication.verify_response(info, function(info){
				callback(info)
			});
		});
	}
}

