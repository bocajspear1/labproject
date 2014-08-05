var log_off_function = null;

module.exports = {

	set_log_off: function(input){
		if (typeof(input)=="function")
			{
				log_off_function = input;
			}else{
				throw new Error("set_log_off is not a function")
			}
	},
	authenticate: function(username, password, callback){
		ss.rpc('auth.authenticate', username, password, function(response){
			callback(response.auth_result);	
		});
	},
	check: function(callback){
		ss.rpc('auth.check', function(response){
			callback(response)
		});
	},
	logout: function(callback){
		ss.rpc('auth.logout', function(response){
			if (response=='logout')
				{
					callback(true)
				}else{
					callback(false)
				}
		});
	},
	verify_response: function(value, callback){
		if (value !== false)
			{
				callback(value);
			}else{
				log_off_function();
			}
	}
}







