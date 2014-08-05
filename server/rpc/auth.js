var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = LABPROJECT_BASE + "/server/lib";

var database = require(LABPROJECT_SERVER_LIBS + '/util/database');
var crypto = require(LABPROJECT_SERVER_LIBS + '/util/crypto');
var config = require(LABPROJECT_BASE + "/config");
var user_session = require(LABPROJECT_SERVER_LIBS + '/util/user_session');




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
	
	function notify_session_switch(socketid)
		{
			ss.publish.socketId(socketid, 'switch_session', 'SWITCH_SESSION');									
		}
	
	return {

		authenticate: function(username,password){
			
			database.findOne('users',{username: username}, function(result){
				if (!result)
					{
						// Login bad
						req.session.authenticated = false;
						req.session.save();
						res({'auth_result':'fail'});
					}else{
						var salt = result.salt;
						
						var hash = crypto.pbkdf2(password,salt);
						
						if (hash == result.hash)
							{
								// Login good, create session
								user_session.make_session(username, req.sessionId, req.socketId, function(message){
									
									// Check if a user_session already exists
									if (message !== false)
										{
											req.session.authenticated = true;
											req.session.username = username;
											req.session.current_socketid = req.socketId;
											req.session.save();
											res({'auth_result':'success'});
										}else{
											user_session.switch_session(username, req.sessionId, req.socketId, function(old_socketid){
												req.session.authenticated = true;
												req.session.username = username;
												req.session.current_socketid = req.socketId;
												req.session.save();
												
												// Notify old socket
												notify_session_switch(old_socketid);
												
												
												res({'auth_result':'success'});
											});
										}
								});
								
							}else{
								// Login Bad
								req.session.authenticated = false;
								req.session.save();
								res({'auth_result':'fail'});
							}
						
					}
			});
			
			//
			
		
		},
		check: function(){
			console.log("Checking");
			// Verify we are logged in
			if (req.session && req.session.authenticated===true)
				{
					// Check for a current user session
					user_session.get_session(req.session.username, function(session_item){
						// Verify we actually got one
						if (session_item === false || session_item == {} || session_item == [])
							{
								// No results, so no user session exists
								// This shouldn't happen, so lets log everything out
								req.session = {};
								
								res(false);
								
							}else{
								// Since there is a user session, check if the current session is on the same socket the same as the stored one.
								if (session_item.socketid == req.socketId)
									{
										// We are, so we can continue
										
										// Check if the user is currently in a lab
										if (req.session.current_lab && req.session.current_lab !== null)
											{
												res(req.session.current_lab);
											}else{
												res(true);
											}
										
									}else{
										
										// We need to switch the session to a new socket
										user_session.switch_session(req.session.username, req.sessionId, req.socketId, function(old_socketid){
											// Tell the old socket
											notify_session_switch(old_socketid);
											
											// Check if the user is currently in a lab
											if (req.session.current_lab && req.session.current_lab !== null)
												{
													res(req.session.current_lab);
												}else{
													res(true);
												}
											
										});
										
									}
							}
					});
					
					
					
					
				}else{
					res(false);
				}
		},
		logout: function()
			{
				console.log("logout");
				req.session.authenticated = false;
				req.session.username = false;
				req.session.save();
				res('logout');
			}
		
	};
	
};


