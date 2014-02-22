require("trace");

var domain = require('domain');
// LOOK INTO KVM

var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";

var os = require('os');
var fs = require('fs');
var child = require('child_process');

var ARCH = os.arch();

// Logging Functionality
var logging = require(LABPROJECT_SERVER_LIBS + "/server_log");

// Database functions
var database = require(LABPROJECT_SERVER_LIBS + '/database');
var vm_database = require(LABPROJECT_SERVER_LIBS + '/vm_database');

var libvirt = require('libvirt');
var config = require(LABPROJECT_BASE +'/config');

var uuid = require('node-uuid');
var xml_builder = require('xmlbuilder');
var xml_parser = require('xmldoc');
var iso_manager = require(LABPROJECT_SERVER_LIBS + '/iso_manager');

var pool_xml = '<pool type="dir"><name>labproject</name><target><path>' + config.pool_path + '</path></target></pool>';

var default_hypervisor = '';

var diskspace = require('diskspace');

if (config.libvirt_path != '')
	{
		process.env.LIBVIRTD_PATH = config.libvirt_path;
	}

// Volume: Functionality for managing volumes

var volume = {
		get_volume_info: function(name){
			
		},
		create_volume: function(sizekb,name,type,callback){
			// Sanitize hd name
			name = name.replace(/[^a-zA-Z\-_]/,"");
			
			// Validate the disk type
			type = vm_util.validate_disk_type(type);
			
			if (type===false)
				{
					callback({ERROR: {message: 'Invalid volume type'}});
					return;
				}

			// Check if the size given is valid
			if (isNaN(sizekb))
				{
					callback({ERROR: {message: 'Invalid volume size'}});
					return;
				}
			
			// Check if there is space on the current device's disk to store the new volume


				
			
			
		
			
			// Get available space
			/*volume.get_available_space(function(space){
				console.log(space);
				
			});
			
				logging.log(logging.TYPES.DEBUG,space);
				// Check for proper response
				if (space!=null)
					{
						// Check if the allocation is greater than the available space
						if (sizekb < space)
							{
								
							
								
								
							}else{
								
								callback({"Error": 'Not enough space available'});
								return;
							}
					}else{
						callback({"Error": 'Could not get currently available disk space'});
					}
				
				
			});*/
			
		},
		remove_volume: function(name, callback){
					
			
			
		},
		import_volume: function(name,path,callback){
			
		},
		clone_volume: function(name,new_name,callback){
			
		},
		get_available_space: function(callback){
			
			
			
		}
	}


var vm_util = {
	register_new_vm: function(hypervisor_string, callback){
			// Create a new uuid
			var new_uuid = uuid.v1();
			
			// Attempt to insert the device
			database.insert('registered_devices',{uuid: new_uuid, hypervisor: hypervisor_string, configured: false, ready: false },function(result){
				if (result.ERROR)
					{ 
						// If there is an error, check if it is indicating that the uuid already exists
						if (result.ERROR.name == "MongoError" && result.ERROR.code == 11000)
							{
								vm_util.register_new_vm(callback);
							}else{
								logging.log(logging.TYPES.CODE_ERROR, result.ERROR);
								return;
							}
					}else{
						// If clear, return new uuid
						callback(new_uuid);
					}
			});
		

	},
	validate_hypervisor: function(name){
		if (name=='qemu'||name=='vbox'||name=='xen')
			{
				return name;
			}else{
				return false;
			}
	},
	convert_to_kilo: function(value,unit){

		if (!isNaN(value))
			{
				var multiplier = 1;
				if (unit=='M')
					{
						multiplier = 1024;
						return value * multiplier;
					}else if (unit =='G'){
						multiplier = 1048576;
						return value * multiplier;
					}else if(unit == 'T'){
						multiplier = 1073741824;
						return value * multiplier;
					}else if(unit == 'P'){
						multiplier = 1099511627776;
						return value * multiplier;
					}else{
						return false;
					}
			}else{
				return false;
			}
	},
	validate_disk_type: function(type){
		
		var valid_disks = ['raw','bochs','cloop','cow','dmg','iso','qcow','qcow2','qed','vmdk','vpc', 'vdi'];
		
		if (valid_disks.indexOf(type)!=-1)
			{
				return type;
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
	verify_pool: function(){
		var hypervisor_string = vm_util.get_connection_string(config.hypervisors[default_hypervisor].libvirtstring);
		var hypervisor = new libvirt.Hypervisor(hypervisor_string);
		try
		{
			var pool = hypervisor.lookupStoragePoolByName('labproject');
		}catch(e){
			//console.log('Nonexistant');
			var result = hypervisor.defineStoragePool(pool_xml);
			result.start();
		}
		var hypervisor = null;
	},
	startup: function(){
		
		// Set the default hypervisor
		var hypervisors = config.hypervisors;
		var i = 0;
		var done = false;
		while (i < hypervisors.length && done === false)
			{
				if (hypervisors[i].enabled === true&&default_hypervisor=='')
					{
						default_hypervisor = i;
						done = true;
					}
				i++;
			}

		// Verify the labproject pool exists
		vm_util.verify_pool();
	},
	
}


function virtual_machine(uuid)
	{
		var self = this;
		
		var Private = {};
		
	/*
	 * Libvirt Connection Variables
	 */ 
		
		
		// Stores the libvirt string of the hypervisor
		Private.hypervisor_string;
		// Returns the connection to the hypervisor
		Private.hypervisor = function(){
			return Private.connect_hypervisor(Private.hypervisor_string);
		};
		Private.domain = function(){
			return Private.hypervisor().lookupDomainByUUID(Private.uuid);
		};
	/*
	 * Private VM Variables
	 */ 
		
		// Stores the name of the vm
		Private.name = "";
		// Stores the uuid of the vm
		Private.uuid = "";
		// Stores an array of hard drives attached to the vm
		Private.hd = [];
		// Stores an array of cdrom drives attached to the vm
		Private.cd = [];
		// Stores the information for the vm display
		Private.display = {protocol: "", settings: {}};
		// Stores the xml of the vm
		Private.xml = '';
		
	/*
	 *  Private Functions
	 */
		
		Private.verify_platform = function(){
			if (ARCH=='ia32'&&self.config.platform=='64bit')
				{
					return {"Error" : "Cannot have 64 bit virtual machine on 32 bit host"};
				}else if (ARCH=='ia32'&&self.config.platform=='32bit'){
					return true;
				}else if(ARCH=='x64'&&(self.config.platform=='64bit'||self.config.platform=='32bit')){
					return true;
				}else{
					return {"Error" : "No platform defined"};
				}
		}
		Private.getHypervisorEmulator = function(){
			
			// Get the capabilities XML from libvirt for the hypervisor
			var capabilities = new xml_parser.XmlDocument(Private.hypervisor().getCapabilities());
			
			// Find the 'guest' children
			var capabilities_guests = capabilities.childrenNamed('guest');
			
			// Loop through each to find a matching emulator if it is there
			for(var i = 0;i < capabilities_guests.length;i++)
					{
						// Get the name attribute
						var emulator_arch = capabilities_guests[i].valueWithPath("arch@name").toString();
						
						// Find a emulator child
						var emulator = capabilities_guests[i].valueWithPath("arch.emulator");
						
						
						// Check if the emulator child exists
						if (emulator)
							{
								// If so, add emulator based on architecture
								if ((emulator_arch=="i686")&&(self.config.platform=="32bit"))
									{
										return emulator;
									}else if (emulator_arch=='x86_64'&&self.config.platform=='64bit'){
										return emulator;
									}else{
										// Continue
									}
							}else{
								// Otherwise there is no emulator, continue
							}
					}
				// If no matches, return false, indicating no emulator
				return false;
			
		};
		Private.createDomainXml = function(){
			
			var vm_memory = vm_util.convert_to_kilo(self.config.memory.value, self.config.memory.unit);
			
			if (vm_memory != false)
				{
					// Create XML builder
					var root = xml_builder.create('domain',{},{},{headless:true});
					
					// Set the type
					root.att('type', Private.hypervisor_string);
					// Set the name
					root.ele('name', {}, Private.name);
					// Set the UUID
					root.ele('uuid', {}, Private.uuid);
					// Set the description
					root.ele('description', {}, self.config.description);
					// Set the memory
					root.ele('memory', {'unit':'KiB'}, vm_memory);
					root.ele('currentMemory', {'unit':'KiB'}, vm_memory);
					
					// Set the number of cpus
					root.ele('vcpu', {'placement':'static'}, self.config.cpus);
					
					// 
					var os_ele = root.ele('os');
					
					
					os_ele.ele('type','hvm');
					
					// Will need loader element for Xen
					if (Private.hypervisor_string=='xen')
						{
							//os_ele.ele('loader','/usr/lib/xen-4.1/boot/hvmloader');
						}
					
					// Set the boot order
					os_ele.ele('boot',{'dev':'cdrom'});
					os_ele.ele('boot',{'dev':'hd'});
					
					// Set the features section
					var features_ele = root.ele('features');
					
					if (self.config.features.acpi === true)
						{
							features_ele.ele('acpi');
						}
					if (self.config.features.apic === true)
						{
							features_ele.ele('apic');
						}
					if (self.config.features.pae === true)
						{
							features_ele.ele('pae');
						}	
					
					// Set reactions to shutdowns and restarts
					root.ele('on_poweroff',{},'destroy');
					root.ele('on_reboot',{},'restart');
					root.ele('on_crash',{},'restart');

					// Set the devices
					var device_ele = root.ele('devices');
					
					
					//console.log(capabilities.childrenNamed('guest')) 
					
					// Get the emulator, if there is one
					vm_emulator = Private.getHypervisorEmulator();
					
					
					// Add the emulator if there is one
					if (vm_emulator!==false)
						{
							device_ele.ele('emulator',{},vm_emulator);
						}
					
					
					// Add the vm input method
					device_ele.ele('input',{'type':'tablet','bus':'usb'});
					
					var last_letter = 0;
					
					// Add the hard disks
					for(var i = 0;i < Private.hd.length;i++)
						{
							if (i > 123)
								{
									
								}else{
									var hd_object = Private.hd[i];
									var hd_letter = String.fromCharCode(97 + i);
									var hd_device_ele = device_ele.ele('disk',{'type':'file','snapshot':'external', 'device':'disk'});
									hd_device_ele.ele('source',{'file': hd_object.disk_path});
									hd_device_ele.ele('target',{'dev':'sd' + hd_letter, 'bus':'sata'});
									console.log(hd_device_ele + "");
									last_letter = (97 + i);
								}
						}
						
					// Add the CDrom drives
					for(var i = 0;i < Private.cd.length;i++)
						{
							if (i > 121)
								{
									
								}else{
									var cd_object = Private.cd[i];
									var cd_letter = String.fromCharCode((last_letter + 2) + i);
									var cd_device_ele = device_ele.ele('disk',{'type':'file','device':'cdrom'});
									if (cd_object.disk_init_path)
										{
											cd_device_ele.ele('source',{'file': cd_object.disk_init_path});
										}
									
									cd_device_ele.ele('target',{'dev':'hd' + cd_letter, 'bus':'ide'});
									cd_device_ele.ele('readonly');
									console.log(cd_device_ele + "");
								}
						}
					
					
					return root.end({ pretty: true});
					
				}else{
					return false;
				}
			
			
		}
		Private.connect_hypervisor = function(){
			if (!Private.hypervisor_string)
				{
					throw new Error("No hypervisor defined");
				}else{
					// Get the hypervisor string
					var connection_string = Private.get_connection_string(Private.hypervisor_string);
					
					// Get the hypervisor
					var hypervisor = new libvirt.Hypervisor(connection_string);
					
					return hypervisor;
				}
		}
		Private.get_connection_string = function(libvirtstring){
			var hypervisor_string = '';
			if (libvirtstring=='xen')
				{
					hypervisor_string = libvirtstring + ':///';
				}else{
					hypervisor_string = libvirtstring + ':///session';
				}
			return hypervisor_string;
		}
		Private.isDefined = function(){
			try
			{
				// Try to get the connection to the domain
				var domain = Private.hypervisor().lookupDomainByUUID(Private.uuid);
				// If we got this far, it is defined
				return true;
			}catch(e){
				// If we got here, it is NOT defined
				return false;
			}
		}
		
	/*
	 *  Private Objects
	 */ 
		
		Private.volume = {
			create_volume: function(name,size,type,callback){

				// Sanitize hd name
				name = name.replace(/[^a-zA-Z\-_]/,"");
				
				// Validate the disk type
				type = vm_util.validate_disk_type(type);
				
				if (type===false)
					{
						callback({"Error": 'Invalid volume type'});
						return;
					}

				// Check if the size given is valid
				if (isNaN(size))
					{
						callback({"Error": 'Invalid volume size'});
						return;
					}
				
				// Check if there is space on the current device's disk to store the new volume
				Private.volume.get_free_hd_space(function(available_space){
					
					if (size > available_space)
						{
							callback({"Error": 'Not enough space available'});
							return;
						}else{
								try
								{
									
									// Get the connection string for the default hypervisor
									var hypervisor = Private.hypervisor();
									
									// Get the pool
									var pool = hypervisor.lookupStoragePoolByName('labproject');
									
									// Make path to disk
									var path_to_disk = config.pool_path + "/" + name +'.' + type;
									// Make the name for disk
									var disk_name = name + '.' + type;
									
									// Make volume xml
									var disk_xml = '<volume><name>' + disk_name + '</name><allocation>0</allocation><capacity unit="K">' + size + '</capacity><target><path>' + path_to_disk + '</path><format type="' + type + '"/></target></volume>';
									
									logging.log(logging.TYPES.DEBUG,"Vol XML: " + disk_xml);
									
									var volume = pool.createVolume(disk_xml);
									
									callback({name: disk_name, path: path_to_disk, type: type, xml: disk_xml});
								}catch(e){
									
									callback({"Error": e});
								}
						}
					
				});
			},
			remove_volume: function(name,callback){
				
			
				try
				{
					var pool = Private.hypervisor().lookupStoragePoolByName('labproject');
					var volume = pool.lookupVolumeByName(name);
					volume.remove();
					callback(null);
				}catch(e){
					//console.log(e);
					callback({"Error": e});
					return;
				}
			},
			get_free_hd_space: function(callback){
				child.exec('df -h ' + config.pool_path, function(err, resp, stderr){ 
	
					if (err||stderr)
						{
							logging.log(logging.TYPES.CODE_ERROR,err);
							callback({"Error":err});
						}else{
								
							logging.log(logging.TYPES.DEBUG,"Good");
							
							var resp_array = resp.split(/\n/);
							var line_array = resp_array[1].split(' ');
							r = line_array.indexOf("");
							while(r != -1)
								{
									line_array.splice(r, 1);
									r = line_array.indexOf("");
								}
							var available = line_array[3];
							available_value = available.slice(0,available.length - 1);
							available_unit = available.slice(available.length - 1)
							
							
							space = vm_util.convert_to_kilo(available_value, available_unit);
							
							callback(space);
							
						}
					}); 

			}
		}
		
		
	/*
	 * Public Variables
	 */
		self.config = {
				description: '',
				platform: '',
				memory: {value: 0, unit: "K"},
				os_type: 'other',
				cpus: 1,
				features: {
					acpi: true,
					apic: true,
					pae: true
				},
		};
		
		
	/*
	 *  Public Functions
	 */

		// Initialization Functions
		
		self.load = function(callback){
			
			vm_database.get_vm_data(Private.uuid,function(data){
				
				// Check if data exists
				if (data!=null)
					{
						if (!data.hypervisor)
							{
								logging.log(logging.TYPES.VM_ERROR,"Hypervisor not set!");
								callback(null);
							}else{
								
								// Set hypervisor from database
								Private.hypervisor_string = data.hypervisor;
								
								if (data.configured === false)
									{
										logging.log(logging.TYPES.DEBUG,"Not Yet Configured");
									}else{
										
										// Load data into object
										self.config = data.config;
										Private.hd = data.hd;
										Private.cd = data.cd;
										Private.name = data.name;
										Private.xml = new Buffer(data.xml_config, 'base64').toString('ascii')
										Private.display = data.display;
										//logging.log(logging.TYPES.DEBUG,Private.xml);
										
									}
							}
					}else{
						logging.log(logging.TYPES.VM_ERROR,"Data Not Found!");
						callback(null);
						return;
					}
					
				callback(self);
			});
			
		};
		self.setName = function(name,callback){
			
			// Check if the database has other machines with the same name
			database.find('registered_devices',{name: name},{},function(result){
				
				// If there is another device with the same name
				if (result.length != 0)
					{
						// Increment number
						increment = function(match,offset,string)
							{
								var raw_number = match;
								raw_number = raw_number.replace("(","");
								raw_number = raw_number.replace(")","");
								var new_number = parseInt(raw_number) + 1;
								
								return "(" + new_number + ")";
							}
						
						// Create new name
						var new_name = name.replace(/\(\d*\)/,increment)
						
						
						if (new_name==name)
							{
								new_name = name + "(1)";
							}

						// Try again
						self.setName(new_name,callback);
						
					}else{
						database.update("registered_devices",{uuid: uuid},{$set: {name: name}},false,function(result){
							if (result&&result.ERROR)
								{
									logging.log(logging.TYPES.CODE_ERROR,result.ERROR);
									callback(false);
								}else{
									
									Private.name = name;
									callback(true);
								}
						});
					}
			});
		},

		// Getter Functions
		
		self.getHypervisor = function(){
			return Private.hypervisor_string;
		};
		self.getUUID = function(){
			return Private.uuid;
		}
		
		// Saving Functions
		
		self.save = function(callback){
			// Check the callback function
			if (typeof callback != "function")
				{
					logging.log(logging.TYPES.CODE_ERROR,"No callback defined");
					return;
				}
			
			var valid_units = ['K','M','G','T','P'];
			var valid_os_types = ['linux','windows','bsd','other'];
			
			// Verify config contents
			var is_valid_platform = Private.verify_platform();
		
			if (typeof self.config.description != "string")
				{
					callback({"Error":"Invalid description"});
				}else if(self.config.platform != '32bit' && self.config.platform != '64bit'){
					callback({"Error":"Invalid platform"});
				}else if(!self.config.memory.value||!self.config.memory.unit){
					callback({"Error":"Memory configuration"});
				}else if(isNaN(self.config.memory.value)){
					callback({"Error":"Invalid memory value"});
				}else if (!is_valid_platform===true){
					callback({"Error":"Invalid platform"});
				}else if (valid_units.indexOf(self.config.memory.unit)==-1){
					callback({"Error":"Invalid memory unit"});
				}else if (valid_os_types.indexOf(self.config.os_type)==-1){
					callback({"Error":"Invalid OS type"});
				}else if (isNaN(self.config.cpus)||self.config.cpus>os.cpus().length){
					callback({"Error":"Invalid CPU number"});
				}else if (typeof self.config.features.acpi != "boolean" || typeof self.config.features.apic != "boolean" || typeof self.config.features.pae != "boolean" ){
					callback({"Error":"Invalid CPU number"});
				}else{
					// If we got this far, things are good
					
					// Remove invalid characters from description
					self.config.description = self.config.description.replace(/[^a-zA-Z0-9_()\[\] \\-]/g,"");
					
					// Create the XML
					var vmXML = Private.createDomainXml();
					
					//logging.log(logging.TYPES.DEBUG, vmXML);
					
					if (vmXML!==false)
						{
							logging.log(logging.TYPES.DEBUG,"Hi");
							try
							{
								var the_domain = Private.hypervisor().defineDomain(vmXML);
					
								Private.xml = the_domain.toXml([]);
								
								
								
								var set_data = {
									config: self.config,
									domain_xml: Private.xml,
									display: Private.display,
									hd: Private.hd,
									cd: Private.cd,
									name: Private.name
								}
								
								vm_database.update_vm_data(Private.uuid,set_data,function(data){
									if (data&&data.Error)
										{
											logging.log(logging.TYPES.CODE_ERROR, data.Error);
											callback(data);
										}else if(data){
											callback(true);
										}else{
											logging.log(logging.TYPES.CODE_ERROR, "Error in updating database");
											callback(false);
										}
								});
								
								//logging.log(logging.TYPES.DEBUG,libvirt_xml);
								
							}catch(e){
								logging.log(logging.TYPES.VM_ERROR,e);
								callback({"Error":e})
							}
							
						}else{
							logging.log(logging.TYPES.CODE_ERROR,"Ouch!");
							callback({"Error": "Cannot define domain xml"})
						}
					
					
					
				}
			
		};
		
	/*
	 * self Objects
	 */
		
		
		self.drive = {
			addCDDrive : function(config,callback){
				var domain;
				if (Private.isDefined())
					{
						domain = Private.hypervisor().lookupDomainByUUID(Private.uuid);
					}else{
						domain = null;
					}
					
					if (Private.isDefined()&&domain)
						{
							
						}else{
							if (!config.name)
								{
									callback({"Error": "CDROM must have name set"});
									return;
								}else{
									config.name = config.name.replace(/[^a-zA-Z0-9_-]/g,"");
									
									var cddisk_object = {
										disk_name: config.name,
										disk_init_path: config.init_disk_path
									};
									Private.cd.push(cddisk_object);
									callback(true);
								}
					}
			},
			removeCDDrive : function(name,callback){
				
			},
			insertCD: function(name,disk_file_path,callback){
				
			},
			addHardDrive : function(config,callback){
				var domain;
				if (Private.isDefined())
					{
						domain = Private.hypervisor().lookupDomainByUUID(Private.uuid);
					}else{
						domain = null;
					}
					
					if (Private.isDefined()&&domain)
						{
							
						}else{
							if (!config.name||!config.size||!config.type)
								{
									callback({"Error": "Hard disk must have name, size and type set"});
									return;
								}else{
									config.name = config.name.replace(/[^a-zA-Z0-9_-]/g,"");
									
									var size = vm_util.convert_to_kilo(config.size.value,config.size.unit)
							
									if (size!=false)
										{
											var disk_name = "";
											if (config.name.trim() == "default")
												{
													disk_name = "default_hd_" + Private.uuid;
												}else{
													disk_name = config.name + "_hd_" + Private.uuid;
												}
											
											
											
											Private.volume.create_volume(disk_name, size, config.type,function(result){
												if (result&&result.Error)
													{
														logging.log(logging.TYPES.CODE_ERROR,result.Error);
														callback(result);
													}else if (result&&result.name&&result.path&&result.xml){
														var disk_object = {
															disk_name: result.name,
															disk_type: result.type,
															disk_path: result.path,
															disk_xml: new Buffer(result.xml).toString('base64')	
														};
														Private.hd.push(disk_object);
														callback(true);
													}
											});
										}
								}
						}
			
				
				
				
			},
			removeHardDrive: function(name,callback){
				Private.volume.remove_volume(name,callback);
			},
			addInterface : function(config,callback){
				
			},
			getDrives : function(callback){
				callback(Private.hd, Private.cd);
			},
		};
		self.state = {
			shutdown: function(nice,callback){
				try
				{
					var domain = Private.hypervisor().lookupDomainByUUID(Private.uuid);
					if (domain.isActive())
						{
							var back;
							if (nice === true)
								{
									back = domain.shutdown();
								}else{
									back = domain.destroy();
								}
								
							if (back===true)
								{
									callback(true);
								}else{
									callback({"Error":"Error shutting down device"});
								}
						
						}else{
							callback({"Error":"VM is not currently running"})
						}
				}catch(e){
					callback({"Error":e})
				}
				
			},
			start: function(callback){
				try
				{
					var domain = Private.hypervisor().lookupDomainByUUID(Private.uuid);
					if (domain.isActive())
						{
							callback({"Error":"VM already running"})
						}else{
							domain.start();
							callback(true);
						}
				}catch(e){
					callback({"Error":e})
				}
			},
		}
		self.snapshot = {
			takeSnapshot: function(snapshot_name, callback){
				snapshot_name = snapshot_name.replace(/[^a-zA-Z\-_]/,"");
				
				database.findOne('snapshots', {uuid: Private.uuid, name: snapshot_name}, function(result){
					if (result)
						{
							callback({"Error": "A snapshot of that name already exists"});
						}else{
							try
							{
								var snapshot_dir = config.snapshot_path + "/" + Private.uuid;
								
								var domain = Private.hypervisor().lookupDomainByUUID(Private.uuid);
								
								var snapshot_root = xml_builder.create('domainsnapshot',{},{},{headless:true});
								snapshot_root.ele('name', {}, snapshot_name);
								var disks_ele = snapshot_root.ele('disks');
								
								// Make the directory for the snapshots
								if (!fs.existsSync(snapshot_dir)) {
									try
									{
										fs.mkdirSync(snapshot_dir, 0755);
									}catch(e){
										callback({"Error": e});
										return;
									}
									
								}
								
								if (self.getHypervisor()!='vbox')
									{
										for(var i = 0;i < Private.hd.length;i++)
											{
												var old_disk_path = Private.hd[i].disk_path;
												var snapshot_disk_path = snapshot_dir + "/" + snapshot_name + "." + Private.hd[i].disk_type;
												
												var single_disk_ele = disks_ele.ele('disk',{name: old_disk_path});
												single_disk_ele.ele('source',{file: snapshot_disk_path});
											}
									}
								
								
								var snapshot_xml = snapshot_root.end({ pretty: true});
								logging.log(logging.TYPES.DEBUG,snapshot_xml);
								var response = domain.takeSnapshot(snapshot_xml);
								
								if (response===true)
									{
										database.insert('snapshots', {uuid: Private.uuid, name: snapshot_name}, function(result){
											if (result&&result.Error)
												{
													callback(result);
												}else{
													callback(true);
												}
											
										});
									}else{
										callback({"Error": "Error in creating snapshot"});
									}
								
								
							}catch(e){
								callback({"Error": e});
							}
						}
				});
				
				
			},
			restoreSnapshot: function(snapshot_name,callback){
				snapshot_name = snapshot_name.replace(/[^a-zA-Z\-_]/,"");
				
				try
				{
					var domain = Private.domain();
					
					domain.revertToSnapshot(snapshot_name);
					
					callback(true);
				}catch(e){
					
				}
			},
			removeSnapshot: function(snapshot_name,callback){
				database.remove('snapshots', {uuid: Private.uuid, name: snapshot_name}, function(result){
					if (result&&result.Error)
						{
							callback(result);
							
							return;
						}else{
							try
							{
								var domain = Private.domain();
								
								domain.deleteSnapshot(snapshot_name);
								
								callback(true);
								
							}catch(e){
								callback({Error: e});
								return;
							}
						}
				});
			},
			removeAllSnapshots: function(callback){
				
				
			},
		} 	
		self.versions = {
			setBase: function(callback){
				try
				{
					var domain = Private.hypervisor().lookupDomainByUUID(Private.uuid);
					
					if (domain.isActive())
						{
							callback({"Error" : "Machine is currently running"});
							return;
						}else{
								var base_name = Private.uuid + "_BASE_IMAGE";
								self.snapshot.takeSnapshot(base_name, function(result){
									if (result&&result.Error)
										{
											callback(result);
										}else{
											callback(true);
										}
								});
						}
				}catch(e){
					callback({"Error" : e});
				}
				
				
				
			
			},
			revertToBase: function(callback){
				try
				{
					var domain = Private.hypervisor().lookupDomainByUUID(Private.uuid);
					
					if (domain.isActive())
						{
							callback({"Error" : "Machine is currently running"});
							return;
						}else{
								var base_name = Private.uuid + "_BASE_IMAGE";
								self.snapshot.restoreSnapshot(base_name, function(result){
									if (result&&result.Error)
										{
											callback(result);
										}else{
											callback(true);
										}
								});
						}
				}catch(e){
					callback({"Error" : e});
				}
				
				
			},
		}
		
		self.remove = function(callback){
			
				try
				{
				// Get the connection to libvirt
				var domain = Private.domain();
				
				// Check if the VM is running
				if (domain.isActive())
					{
						callback({"Error":"Virtual Machine is currently running"});
						return;
					}
					
				}catch(e){
					logging.log(logging.TYPES.VM_ERROR, error);
					callback({"Error": error});
					return;
				}
				
				
					
				// Remove the VM from the database
				database.remove('registered_devices', {uuid: Private.uuid}, function(result){
					// Delete the domain			
					try
					{
						if (domain)
							{
								domain.undefine();
							}
					}catch(error){
						
						logging.log(logging.TYPES.VM_ERROR, error);
						callback({"Error": error});
						return;
					}
					
					// Remove all snapshots from the database
					self.snapshot.removeAllSnapshots(function(){
						// Remove all hard disks
						
						for(var i = 0;i < Private.hd.length;i++)
							{
								logging.log(logging.TYPES.DEBUG, "Removing: " + Private.hd[i].disk_name);
								var toRemove = Private.hd[i].disk_name;
								self.drive.removeHardDrive(toRemove,function(result){
									if (result&&result.Error)
										{
											logging.log(logging.TYPES.VM_ERROR, result.Error);
											callback(result);
											return;
										}else{
											
										}
								});
							}
							
						callback();
					});
				
			});
				
			
			
			
			
		};
	
		if (uuid)
			{
				
				Private.uuid = uuid;
				console.log(Private.uuid);
			}else{
				self = null;
				return;
			}
	
	}


/*
 * Startup Function
 */
	vm_util.startup();

/*
 * Exported functions
 */

module.exports = {
	get_available_hypervisors: function(){
		
		var results = Array();
		
		var hypervisors = config.hypervisors;
		for (var i = 0;i < hypervisors.length; i++)
			{
				if (hypervisors[i].enabled === true)
					{
						if (default_hypervisor=='')
							{
								default_hypervisor = i;
							}
						results.push({name: hypervisors[i].name, id: hypervisors[i].libvirtstring});
					}
			}
		return results;
		
	},
	get_libvirt_version: function(callback){
		var version = libvirt.libvirt_version + "";
		version = version.replace("000",".0");
		version = version.replace("00",".");
		if (callback)
			{
				callback(version)
			}else{
				return version;
			}
	},
	volume: volume,
	iso_manager: iso_manager,
	get_hypervisor_devices: function(hypervisor_string,callback){
		var result = vm_util.validate_hypervisor(hypervisor_string);
		if (result!==false)
			{
				database.find('registered_devices',{hypervisor: result},{fields: {uuid: 1, _id: 0}},function(result){
					callback(result);
				});
			}else{
				
			}
	},
	getVM: function(uuid,callback){
		if (uuid&&uuid.toString().trim()!='')
			{
				
				var vm = new virtual_machine(uuid);
				vm.load(callback);
				
			}else{
				
			}
		
		
	},
	newVM: function(name, hypervisor ,callback){
		name = name.replace(/[^a-zA-Z0-9_-]/g,"");
		
		
		
		if (vm_util.validate_hypervisor(hypervisor)!=false)
			{
				vm_util.register_new_vm(hypervisor,function(uuid){
					var vm = new virtual_machine(uuid);
					vm.setName(name,function(result){
						vm.load(callback);
					});
				});
			}
		
		
		
	},

}

