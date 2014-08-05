var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = LABPROJECT_BASE + "/server/lib";

var database = require(LABPROJECT_SERVER_LIBS + '/util/database');
var user_manager = require(LABPROJECT_SERVER_LIBS + '/managers/user_manager');

var uuid = require('node-uuid');


var lab_util = {
	new_lab: function(lab_name, username, callback){
			
			var new_uuid = uuid.v1();
		
			var current_time = new Date().getTime();


			var new_lab_object = {
				lab_id: new_uuid,
				name: lab_name,
				status: "open",
				description: "",
				current_topology: {
						devices: [],
						connections: [],
				},
				saves: {},
				shares: {},
				last_accessed: current_time,
				last_modified: current_time,
				creation_date: current_time,
				last_touch: current_time,
				owner: username,
				extra: {}
			};
			
			// Attempt to insert the device
			database.insert('labs',new_lab_object,function(result){
				if (result.ERROR)
					{ 
						// If there is an error, check if it is indicating that the uuid already exists
						if (result.ERROR.name == "MongoError" && result.ERROR.code == 11000)
							{
								lab_util.new_lab(lab_name,username,callback);
							}else{
								logging.log(logging.TYPES.CODE_ERROR, result.ERROR);
								return;
							}
					}else{
						// If clear, return new lab object
						lab_util.get_lab(new_uuid,callback);
					}
			});	
	},
	// Retrieves a lab object and loads it
	get_lab: function(lab_id, callback){
		
		var the_lab = new lab(lab_id);
		the_lab.load(callback);
		
	},
};


function lab_share(type, name)
		{
			var self = this;
			var Private = {
				permissions: {
					devices: {
						access: {},
						modify: {},
						add: false,
						remove: {},
						move: {}
					},
					connections: {
						add: false,
						remove: {},
						modify: {}
					},
					lab: {
						stop: false,
						start: false,
						open_access: false
					}
				}
			}; 
			
			if ((type !== 'user' || type !== 'group') || !name)
				{
					self = null;
				}
			
			Private.toggle_permission = function(type, name, input){
				if (input !== false || input !== true || ! Private.permissions[type] || ! Private.permissions[type][name] )
					{
						throw new Error("Invalid setting for permission " + type + "." + name + " of " + input);
					}else{
						Private.permissions[type][name] = input;
					}
			};
			
			self.can_start = function(input)
				{
					Private.toggle_permission('lab','start',input);
				};
			
			self.can_stop = function(input)
				{
					Private.toggle_permission('lab','stop',input);
				};
			
			self.has_open_access = function(input)
				{
					Private.toggle_permission('lab','open_access',input);
				};
			
			self.can_add_device = function(input)
				{
					Private.toggle_permission('device','add',input);
				};
			
			self.can_add_connection = function(input)
				{
					Private.toggle_permission('connection','add',input);
				};
			
			Private.toggle_object = function(type, name, device_uuid, input)
				{
					if (input !== false || input !== true || ! Private.permissions[type] || ! Private.permissions[type][name])
						{
							throw new Error("Invalid setting for permission " + type + "." + name + " of " + input);
						}else{
							Private.permissions[type][name][device_uuid] = input;
						}
				};
			
			
			self.can_move_device = function(device_uuid, input)
				{
					Private.toggle_object('device','move',device_uuid,input);
				};
			
			self.can_remove_device = function(device_uuid, input)
				{
					Private.toggle_object('device','remove',device_uuid,input);
				};
			
			self.can_access_device = function(device_uuid, input)
				{
					Private.toggle_object('device','access',device_uuid,input);
				};
			
			self.can_modify_device = function(device_uuid, input)
				{
					Private.toggle_object('device','modify',device_uuid,input);
				};
			
			self.can_modify_connection = function(connection_id, input)
				{
					Private.toggle_object('connection','modify',connection_id,input);
				};
			
			self.can_remove_connection = function(connection_id, input)
				{
					Private.toggle_object('connection','remove',connection_id,input);
				};

			self.get = function(){
				return Private.permissions;
			};
			
			self.load = function(input){
				if (input.hasProperty('device') && input.hasProperty('connection') && input.hasProperty('lab'))
					{
						Private.permissions = input;
					}else{
						throw new Error("Invalid load");
					}
				
			};
		}


function lab(id)
{
	var self = this;
	var Private = {};
	
	if (id)
		{
			Private.id = id;
		}else{
			self = null;
		}
	
	Private.name = "";
	// open, closed
	Private.status = "open";
	Private.description = "";

	Private.current_topology = {
			devices: [],
			connections: [],
	};
	
	Private.saves = {};
	
	Private.shares = {
		by_group: {},
		by_user:{}
	};
	Private.last_accessed = "";
	Private.creation_date = "";
	Private.last_touch = "";
	Private.owner = "";
	Private.extra = {};		
	Private.save_id = "";
	
	// Load lab data from the database
	Private.retrieve = function(callback){
		database.findOne("labs",{"lab_id": Private.id},function(result){
			if (result && result.Error)
				{
					callback(result);
				}else if (result === null){
					callback(false);
				}else{
					// Set data in object from database
					
					Private.name = result.name;
					
					Private.status = result.status;
					Private.description = result.description;
					Private.saves = result.saves;
					Private.shares = result.shares;
					Private.last_accessed = result.last_accessed;
					Private.creation_date = result.creation_date;
					Private.last_touch = result.last_touch;
					Private.owner = result.owner;
					Private.extra = result.extra;	
					
					callback();
				}
		});
	};
	
	// Indicate that a change has been made so the lab is not recycled or current_topology is cleared
	self.touch = function(callback){
		var current_time = new Date().getTime();
		
		database.update('labs', {"lab_id": Private.id} , {$set: {last_touch: current_time}}, false, function(results){
			callback(results);
		});
	};
	
	
	// Create a save point
	self.create_save_point = function(save_name, callback){
		
		var current_time = new Date().getTime();
		
		if (Private.saves[save_name])
			{
				callback({"Error":"Save point already exists"});
			}else{

				var new_save_point = {};
				
				new_save_point.name = save_name;
				if (Private.current_topology)
					{
						new_save_point.topology = {};
						new_save_point.topology.devices = Private.current_topology.devices;
						new_save_point.topology.connections = Private.current_topology.connections;
					}
				
				new_save_point.creation_time = current_time;
				
				Private.saves[save_name] = new_save_point;
				
				// Create snapshots of all devices
				for (var i = 0; i < Private.current_topology.devices.length; i++)
					{
						var current_device = Private.current_topology.devices[i];
						
						
						
					}
				callback();	
			}
		
		
	};
	
	// Loads a save point into the lab config
	self.open_save_point = function(save_id, callback){
		
		if (Private.saves[save_id])
			{
				// Load the topology from the save point
				Private.current_topology = Private.saves[save_id].topology;
				
				// Indicate which snapshot to load to when starting the lab
				Private.save_id = save_id;
			}else{
				callback({"Error": "Save does not exist"});
			}
	};
	
	self.remove_save_point = function(save_id, callback){
		
	};
	
	// Start lab
	self.start = function(callback){
		if (Private.current_topology.devices.length !== 0)
			{
				// Allocate each device, revert and fallback if all of them are not available
				for (var i = 0; i < Private.current_topology.devices.length; i++)
					{
						var current_device = Private.current_topology.devices[i];
						
					}
				// Move all devices to correct snapshot
			}
		
		callback(true);
	};
	
	// Stop Lab
	self.stop = function(callback){
		if (current_topology.devices.length !== 0)
			{
				// Deallocate all devices
				
				// Move all devices to base snapshot
				
			}
		callback(true);
	};
	
	self.close = function(callback){
		// Check if there is nothing current topology
		
		// Set to closed lab
	};
	
	
	
	
	
	// Functions for creating and managing shares
	
	self.get_shares = function(callback){
		callback(Private.shares);
	};

	self.new_share = function(type, name, callback){
		if ((type == 'user' || type == 'group') && name !== '')
			{
				callback(new lab_share(type, name));
			}else{
				
			}
		
	};
	
	self.new_share = function(share, callback){
		if (share instanceof lab_share)
			{
				
			}else{
				callback({"Error":"Not a share object"});
			}
	};
	
	self.get_share = function(type, name, callback){
		
	};
	
	self.update_share = function(assign_to, assign_type, share, callback){
		self.add_share(assign_to, assign_type, share, callback);
	};
	
	self.remove_share = function(assign_to, assign_type,callback){
		if (assign_type == 'user')
			{
				if (Private.shares.by_user[assign_to])	
					{
						Private.shares.by_user[assign_to] = null;
					}else{
						callback({"Error":"No share for user " + assign_to});
					}
			}else if (assign_type == 'group'){
				if (Private.shares.by_group[assign_to])	
					{
						Private.shares.by_group[assign_to] = null;
					}else{
						callback({"Error":"No share for group " + assign_to});
					}
			}else{
				callback({"Error":"Invalid assign_type"});
			}
	};
	
	self.in_lab = function(id, callback){
		
	};
	
	
	self.get_owner = function(){
		return Private.owner;
	};
	
	self.set_owner = function(new_owner, callback){
		user.get_user(new_owner, function(user_object){
			if (user_object && user_object.Error)
				{
					callback(user_object);
				}else if (user_object === null){
					callback({"Error":"User not found"});
				}else{
					Private.owner = new_owner;
					
					callback(true);
				}
		});
	};
	
	self.get_description = function(){
		return Private.description;
	};
	
	self.set_description = function(input){
		var clean_input = input.replace(/[^ a-zA-Z0-9'"\n\(\)%&.?\-_]/g,"");
		
		Private.description = clean_input;
	};
	
	self.get_name = function(){
		return Private.name;
	};
	
	self.set_name = function(name){
		Private.name = name.replace(/[^a-zA-Z\-_]/g,"");
	};
	

	// Save data to database
	self.save = function(callback){
		
			var current_time = new Date().getTime();
		
			var update_lab_object = {
				name: Private.name,
				status: Private.status,
				description: Private.description,
				current_topology: Private.current_topology,
				saves: Private.saves,
				shares: Private.shares,
				last_accessed: Private.last_accessed,
				last_touch: current_time,
				owner: Private.owner,
				extra: Private.extra
			};

			database.update('labs', {"lab_id": Private.id} , {$set: update_lab_object}, false, function(results){
				callback(results);
			});

	};
	
	// Load data from database to object
	self.load = function(callback){
		Private.retrieve(function(){
			callback(self);
		});
	};
	
	self.remove = function(callback){
		database.remove('current_labs',{'lab_id':Private.id},function(results){
			if (results)
				{
					callback(results);
					self = null;
				}else{
					callback(false);
					self = null;
				}
		});
	};

	
	self.devices = {
		add: function(name,username,device_uuid,callback){
		
		},
		remove: function(name,username,device_uuid,callback){
			
		},
		allocate: function(name,username, device_uuid,callback){
			
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
		deallocate: function(name,username,device_uuid,callback){
			
		}
	};
}

module.exports = {

	get_all_labs: function(username, callback){
		
		user_manager.verify_user(username, function(result){
			if (result === true)
				{
					user_manager.get_user_membership(username,function(group_list){
						if (!group_list || group_list.Error)
							{
								
							}else{
								// Find labs where  either the user is owner, or has a share to it
								database.find('labs', {$or: [
									{"owner": username},
									{"shares": {$elemMatch: {"type": "user", name: username}}},
									{"shares": {$elemMatch: {"type": "group", name: {$in: group_list}}}}
								]}, {fields: {"_id": false, "lab_id": true}}, function(results){
									callback(results);
								});
							}
						
					});
					
				}else{
					callback([]);
				}
		});
		
	},
	
	get_lab: lab_util.get_lab,
	new_lab: lab_util.new_lab,
	

	cleanup: function(){
		
	}
};

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
