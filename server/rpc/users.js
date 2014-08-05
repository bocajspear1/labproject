exports.actions = function(req, res, ss){
	
	// Get Session
	req.use('node_session.run');
	var temp = res;
	res = function(input){
			res = temp;
			req.session.save();
			res(input); 
	};
	// Verify the user has authenticated
	req.use('auth_check.run');
	
	return {
		get_user_info: function(username){
			
		},
		
	};
};
