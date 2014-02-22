

var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = LABPROJECT_BASE + "/server/lib";

var database = require(LABPROJECT_SERVER_LIBS + '/database');

var devices = {
	add_device: function(name,username,device_uuid,callback){
		
	},
	remove_device: function(name,username,device_uuid,callback){
		
	},
	allocate_device: function(name,username, device_uuid,callback){
		
		// Verify user has permissions to access the device
		
		database.insert('current_devices',{uuid: device_uuid},function(result){
			console.log("#1: ", result);
			
			
		});
		
		database.insert('current_devices',{uuid: '123'},function(result){
			console.log("#2: ", result);
			if (result.ERROR)
				{
					if (result.ERROR.name == "MongoError" && result.ERROR.code == 11000)
						{
							console.log('Duplicate!');
						}
				}
		});
		
		callback();
	},
	deallocate_device: function(name,username,device_uuid,callback){
		
	}
};

module.exports = {
	get_current_labs: function(username,callback){
		
		
		
		database.find('current_labs',{},{},function(results){
			if (!results)
				{
					callback(false);
				}else{
					callback(results);
				}
		});
	},
	get_saved_labs: function(username,callback){
		database.find('saved_labs',{},{},function(results){
			if (results.length == 0)
				{
					callback(false);
				}else{
					callback(results);
				}
		});
	},
	new_lab: function(name,username,callback){
		
		
		// check if there is not already a lab with this name
		module.exports.get_lab(name,username,function(result){
			if (!result)
				{
					// Get current time
					var now = new Date().getTime();
					
					// Validate username?
					
					var new_lab = {labname: name, username: username, last_modified: now, data:{}}
		
					database.insert('current_labs', new_lab, function(){
						callback(name);
					});
					
				}else{
					callback({error: 'A lab by that name already exists'});
				}
		});
	
					
		
		
	},
	get_lab: function(name,username,callback){
		database.findOne('current_labs',{labname: name, username: username},function(results){
			if (results)
				{
					callback(results);
				}else{
					callback(false);
				}
		});
	},
	delete_lab: function(name,username,callback){
		database.remove('current_labs',{labname: name, username: username},function(results){
			if (results)
				{
					callback(results);
				}else{
					callback(false);
				}
		});

	},
	update_lab: function(name,username,data,callback){
		
	},
	load_saved_lab: function(name,username,callback){
		
	},
	save_current_lab: function(name,username,callback){
		
	},
	remove_old_current_labs: function(){
		
	},
	devices: devices,
	cleanup: function(){
		var current_timestamp = new Date().getTime() - 14400;
		
		
		database.find('current_labs',{last_modified: {$lte: current_timestamp}},{},function(results){
			console.log('Old Labs: ',results);
		});
	}
}

/*
{
	uuid:
	x:
	y:
	layer:
	connection: 
	config: 
}

*/
