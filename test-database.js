var database = require('./server/lib/database');


database.find('registered_devices',{uuid: "asdfasfadsf"},{},function(result){
	console.log(result);
	
});
