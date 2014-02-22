var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = LABPROJECT_BASE + "/server/lib";

var database = require(LABPROJECT_SERVER_LIBS + '/database');
var crypto = require(LABPROJECT_SERVER_LIBS + '/cryptojs');
var config = require(LABPROJECT_BASE + "/config");
var user_session = require(LABPROJECT_SERVER_LIBS + '/user_session');

exports.actions = function(req, res, ss){

	//console.log(req);
		
	//req.use('session');
	req.use('node_session.run');
	var temp = res;
	res = function(input){
			res = temp;
			req.session.save();
			res(input);
		};
	
	
	return {

		authenticate: function(username,password){
			
			user_session.check(username,function(result){
				if (result===false)
					{
						req.session.authenticated = false;
						req.session.save();
						res({'auth_result':'fail'});
					}else{
							database.findOne('users',{username: username},function(result){
							if (!result)
								{
									req.session.authenticated = false;
									req.session.save();
									res({'auth_result':'fail'});
								}else{
									var salt = result.salt;
									var hashed_password = crypto.pbkdf2_hash(password,salt,500);
									
									if (hashed_password==result.password)
										{
											req.session.authenticated = true;
											req.session.username = username;
											req.session.save();
											res({'auth_result':'success'});
										}else{
											req.session.authenticated = false;
											req.session.save();
											res({'auth_result':'fail'});
										}
									
								}
						});
					}
			});
			
			//res({'AUTH':'SUCCESS'});
		},
		check: function(){
			console.log("Checking");
			if (req.session && req.session.authenticated===true)
				{
					res('success');
				}else{
					//res('fail');
					res('success');
				}
		},
		logout: function()
			{
				console.log("logout");
				req.session.authenticated = false;
				req.session.username = false;
				req.session.save();
				res('logout');
			},
			
		device_permissions: function()
			{
				if (req.session&&req.session.authenticated === true)
					{
						var username = req.session.username;
						database.findOne('users',{username: username},function(result){
							if (!result)
								{
									res('FAIL');
								}else{
									if(result.privileges.devices === true)
										{
											res('SUCCESS');
										}else{
											res('FAIL');
										}
								}
						});
					}
				
			}
		
	}
	
}


