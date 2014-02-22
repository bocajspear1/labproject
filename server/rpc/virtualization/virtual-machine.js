var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = LABPROJECT_BASE + "/server/lib";

var database = require(LABPROJECT_SERVER_LIBS + '/database');
var config = require(LABPROJECT_BASE + "/config");
var virtualization = require(LABPROJECT_SERVER_LIBS + '/virtualization');

var libvirt = require('libvirt');




exports.actions = function(req, res, ss){
	req.use('node_session.run');
	req.use('auth_check.run');
	
	return {
		get_available_hypervisors: function()
			{
				res(virtualization.get_available_hypervisors());
			}
	}
	
}

function get_available_hypervisors()
	{
	
		var results = Array();
		
		var hypervisors = config.hypervisors;
		for (var i = 0;i < hypervisors.length; i++)
			{
				if (hypervisors[i].enabled === true)
					{
						results.push({name: hypervisors[i].name, id: hypervisors[i].libvirtstring});
					}
			}
	
		res(results);
	}

function get_register_devices(callback)
	{
		database.find('registered_devices',{},{},function(results){
				callback(results);
			});
	}
	
function register_device(info,callback)
	{
		
	}

function unregister_device(callback)
	{
		
	}

function find_unregistered_devices(callback)
	{
		
	}


		
	
function delete_device(callback)
	{
		
	}
