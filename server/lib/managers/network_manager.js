var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";

var os = require('os');

// Logging Functionality
var logging = require(LABPROJECT_SERVER_LIBS + "/util/server_log");

// Database functions
var database = require(LABPROJECT_SERVER_LIBS + '/util/database');

// Utility functions
var util = require(LABPROJECT_SERVER_LIBS + '/util/util');

var sanitize = require(LABPROJECT_SERVER_LIBS + '/util/sanitize');

var libvirt = require('libvirt');
var config = require(LABPROJECT_BASE +'/config');

var uuid = require('node-uuid');
var xml_builder = require('xmlbuilder');
var ip_helper = require('ip');

if (config.libvirt_path !== '')
	{
		process.env.LIBVIRTD_PATH = config.libvirt_path;
	}

var default_hypervisor = '';
var config = require(LABPROJECT_BASE +'/config');


var network_util = {
	check_ip_available: function(){
		
	},
	is_ip_address: function(ip_addr){
		var basic_regex = /^[1-2]?[0-9]?[0-9]{1}\.[1-2]?[0-9]?[0-9]{1}\.[1-2]?[0-9]?[0-9]{1}\.[1-2]?[0-9]?[0-9]{1}/;
		
		if (basic_regex.match(ip_addr))
			{
				var address_parts = ip_address.split(/\./);
				
				for (var i = 0; i < 4; i++)
					{
						if (address_parts[i] > 255)
							{
								return false;
							}
					}
				
				return true;
			}else{
				return false;
			}
	},
	get_connection_string: function(libvirtstring){
		var hypervisor_string = '';
		if (libvirtstring=='xen')
			{
				hypervisor_string = libvirtstring + ':///';
			}else{
				hypervisor_string = libvirtstring + ':///session';
			}
		return hypervisor_string;
	},
	startup: function(){
		// Set the default hypervisor
		var hypervisors = config.hypervisors;
		var done = false;
		var i = 0;
		while (i < hypervisors.length && done === false)
			{
				if (hypervisors[i].enabled === true&&default_hypervisor==='')
					{
						default_hypervisor = hypervisors[i].libvirtstring;
						done = true;
					}
				i++;
			}

	}
};

function network(name)
	{
		var self = this;
		var Private = {
			name: '',
			default_route: '',
			range_start: '',
			range_end: '',
			bridge_name: '',
			bitmask: 24,
			xml: ''
		};
		
		Private.create_network_xml = function(){
			var root = xml_builder.create('network',{},{},{headless:true});
			
			root.ele('name', {}, Private.name);
			root.ele('uuid', {},uuid.v1());
			root.ele('bridge', {name: Private.bridge_name}, Private.name);
			root.ele('forward', {});
			
			var ip_address_ele = root.ele('ip', {'address': Private.default_route, 'netmask': ip.fromPrefixLen(bitmask)});
			var dhcp_ele = ip_address_ele.ele('dhcp', {});
			dhcp_ele.ele('range', {start: Private.range_start, end: Private.range_end});
			
			
			
			return root.end({pretty: true});
			
		};
		
		// Only load data of network from database
		self.load = function(callback){
			database.findOne('networks', {name: Private.name}, function(result){
				if (!result || result === null)
					{
						callback({"Error": {"error_message": "NO_DATA_FOUND", "message_type": "CONFIG"}});
					}else{
						Private.default_route = result.default_route;
						Private.range_start = result.range_start;
						Private.range_end = result.range_end;
						Private.bridge_name = result.bridge_name;
						Private.bitmask = result.bitmask;
						Private.xml = new Buffer(result.xml, 'base64').toString('ascii'); 
						
						callback(self);
						
					}
			});
		};
		
		// Save network to database
		self.save = function(callback){
			
			Private.xml = Private.create_network_xml();
			
			var save_object = {
				default_route: Private.default_route,
				range_start: Private.range_start,
				range_end: Private.range_end,
				bridge_name: Private.bridge_name,
				bitmask: Private.bitmask,
				xml: new Buffer(Private.xml).toString('base64')	 
			};
			
			database.update('networks', {name: Private.name}, {$set: save_object}, function(result){
				if (result&&result.Error)
					{
						callback(result);
					}else{
						callback(true);
					}
			});
		};
		
		// Define and start the network in libvirt
		self.enable = function(callback){
			var temp_xml = Private.create_network_xml();
			
			try
			{
				var Hypervisor = libvirt.Hypervisor;
				
				var current_hypervisor = new Hypervisor(network_util.get_connection_string(default_hypervisor));
				
				var network = current_hypervisor.createNetwork(temp_xml);
				
				Private.xml = network.toXml([]);
				
				callback(true);
				
			}catch(e){
				logging.log(logging.TYPES.VM_ERROR,e);
				callback({"Error":{"error_message": e, "message_type": "LIBVIRT"}});
			}
		
		};
		
		// Undefine the network
		self.disable = function(callback){
			
			try
			{
				var Hypervisor = libvirt.Hypervisor;
				
				var current_hypervisor = new Hypervisor(network_util.get_connection_string(default_hypervisor));
				
				var network = current_hypervisor.lookupNetworkByName(Private.name);
				
				network.destroy();
				network.undefine();
				
				callback(true);
				
			}catch(e){
				logging.log(logging.TYPES.VM_ERROR,e);
				callback({"Error":{"error_message": e, "message_type": "LIBVIRT"}});
			}
			
		};
		
		self.remove = function(callback){
			self.disable(function(){
				database.remove('networks', {name: Private.name}, function(result){
					if (result&&result.Error)
						{
							callback(result);
						}else{
							callback(true);
						}
				});
			});
		};
		
		// Set the NAT range for the network
		self.set_range = function(default_route, start, end, bitmask, callback){
			if (network_util.is_ip_address(default_route)&&network_util.is_ip_address(start)&&network_util.is_ip_address(end) && (bitmask <= 30 && bitmask > 0))
				{
					Private.default_route = default_route;
					Private.range_start = start;
					Private.range_end = end;
				}else{
					callback({"Error":{"error_message": "INVALID_IP_ADDRESS", "message_type": "CONFIG"}});
				}
		};
		
		if (name)
			{
				Private.name = sanitize.simple_string(name);
			}else{
				self = {"Error":{"error_message": "NAME_NOT_SET", "message_type": "CONFIG"}};
				return;
			}
		
	}

network_util.startup();

module.exports = {
	new_network: function(name, callback){

		var blank_network = {
			name: sanitize.simple_string(name),
			default_route: '',
			range_start: '',
			range_end: '',
			bridge_name: '',
			bitmask: 24,
			xml: ''
		};
		
		// Attempt to insert the device
		database.insert('networks', blank_network ,function(result){
			if (result.Error)
				{ 
					// If there is an error, check if it is indicating that the uuid already exists
					if (result.Error.error_message.name == "MongoError" && result.Error.error_message.code == 11000)
						{
							callback({"Error":{"error_message": "NETWORK_NAME_EXISTS", "message_type": "CONFIG"}});
						}else{
							logging.log(logging.TYPES.CODE_ERROR, result.Error);
							callback(result);
							return;
						}
				}else{
					// If clear, return new uuid
					callback(new_uuid);
				}
		});
	},
	get_network: function(name,callback){
		
		name = sanitize.simple_string(name);
		
		var network_object = new network(name);
		
		network_object.load(callback);
		
		
	},
	network_exists: function(name, callback){
		name = sanitize.simple_string(name);
		
		database.findOne('networks', {name: name}, function(result){
			if (result)
				{
					callback(true);
				}else{
					callback(false);
				}
		});
	}
};


