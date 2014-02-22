
module.exports = {
	authenticate: function(username,password, callback){
		ss.rpc('auth.authenticate', username, password, function(response){
			callback(response.auth_result);	
		});
	},
	logout: function(callback){
		ss.rpc('auth.logout', function(response){
			callback(response);	
		});
	},
	check_device_permissions: function(callback){
		ss.rpc('auth.device_permissions', function(response){
			if (response=='SUCCESS')
				{
					callback(true);
				}else{
					callback(false);
				}
		});
	}
}







