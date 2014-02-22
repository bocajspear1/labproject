var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";

var database = require(LABPROJECT_SERVER_LIBS + '/database');

var config = require(LABPROJECT_BASE +'/config');
var user_session = require(LABPROJECT_SERVER_LIBS + '/user_session');


var connection_string = config.database_connection_string;
var storage_manager = require('./mongodb_node_session.js').session_storage;

var session_storage = new storage_manager({connection_string: connection_string});

session_storage.session_expire_time = 14400;

session_storage.on_destroy = function(sessionid,session_data){
	user_session.remove_lock(sessionid,function(){});
};

function socket_stream_session()
	{
		
		this.storage = session_storage;
		
		
		this.run_session = run_session
		function run_session(req,res,next)
			{
				var innerthis = this;
				
				this.storage.cleanup(function(){
					
					//console.log('Running Session', req.sessionId);
					
					var sessionid = req.sessionId;
					
					if (!req.session)
						{
							req.session = {};
						}
					
					innerthis.set_session(sessionid, function(session){
						
							// Proxy res to simplify things
							var temp_res = res;
							//console.log(temp_res);
							res = null;
							//console.log(res);
							/*res = function(input){
									//temp_res;
									console('Overwritten res!');
									innerthis.save_session(sessionid,req.session,function(){
										console('Saving in over written res!');
										temp_res(input);
									});
								};*/
							//console.log(res);
							req.session = session;
							
							
							next();
						});
						
						
				});
			}
	
		this.set_session = set_session;
		function set_session(sessionid, callback)
			{
				var session = {};
				
				//console.log('Setting Session');
				var innerthis = this;
				
				
				this.get_session(sessionid,function(result){
					if (result)
						{
							//console.log(result.data);
							session = result.data;
						}else{
							
						}
						
					session.save = function()
						{
							innerthis.save_session(sessionid,session,function(){});
						}
						
					session.delete = function()
						{
							innerthis.delete_session(sessionid);
						}
					
					callback(session);	
				});
			}
		

		this.get_session = get_session;
		function get_session(sessionid,callback)
			{
				this.storage.get_session(sessionid,function(session_data){
					
					callback(session_data);
				});
			}
		
		this.delete_session = delete_session;
		function delete_session(sessionid,callback)
			{
				this.storage.destroy_session(sessionid,function(){
					callback();
				});
			}
			
		this.save_session = save_session;
		function save_session(sessionid,data,callback)
			{
				

				//console.log("Saving!" , data);
				this.storage.save_session(sessionid,data,function(){
					callback();
				});
			}
	}

var session = new socket_stream_session();

exports.run = function(){

  return function(req, res, next){

	
	session.run_session(req,res,next);

  }

}

