var user = require('./server/lib/user_manager');
var logger = require('./server/lib/server_log');

var config = {
	firstname: "Jacob",
	lastname: "Hartman",
	username: "jhartman",
	email: "hartmajh@sunyit.edu",
	password: "TestSomeStuff"
}

user.new_user(config,function(result){
	if (result.Error)
		{
			
		}else{
			user.get_user("jhartman",function(result){
				if (result&&result.Error)
					{
						logger.log(logger.TYPES.CODE_ERROR, result);
					}else{
						logger.log(logger.TYPES.CODE_NOTICE, "Good");
						console.log(result);
						user.delete_user('jhartman',function(){
							if (result === false)
								{
									logger.log(logger.TYPES.CODE_ERROR, "Failed");
								}else{
									logger.log(logger.TYPES.CODE_NOTICE, "Good");
								}
						});
					}
			});
			
		}
});
