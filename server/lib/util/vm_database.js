var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";

// Logging Functionality
var logging = require(LABPROJECT_SERVER_LIBS + "/util/server_log");

// Database functions
var database = require(LABPROJECT_SERVER_LIBS + '/util/database');



module.exports = {
	get_vm_data: function(uuid,callback){
		database.findOne('registered_devices',{uuid: uuid},function(data){
			callback(data);
		});
	},
	update_vm_data: function(uuid, input, callback){
		database.update('registered_devices', {uuid: uuid}, { $set: 
			{
				config: input.config,
				name: input.name,
				xml_config: new Buffer(input.domain_xml).toString('base64'),	
				hd: input.hd,
				cd: input.cd,
				display: input.display,
				configured: true
			}
		},false, function(result){
			callback(result);
		});
	},
	delete_vm_data: function(uuid,callback){
		
	}
};
