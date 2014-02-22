// LOOK INTO KVM

var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";

var os = require('os');
var exec = require('child_process').exec;

var ARCH = os.arch();

// Logging Functionality
var logging = require(LABPROJECT_SERVER_LIBS + "/server_log");

// Database functions
var database = require(LABPROJECT_SERVER_LIBS + '/database');

var libvirt = require('libvirt');
var config = require(LABPROJECT_BASE +'/config');

var uuid = require('node-uuid');
var xml_builder = require('xmlbuilder');
var xml_parser = require('xmldoc');
var iso_manager = require(LABPROJECT_SERVER_LIBS + '/iso_manager');

var pool_xml = '<pool type="dir"><name>labproject</name><target><path>' + config.pool_path + '</path></target></pool>'

var default_hypervisor = '';

if (config.libvirt_path != '')
	{
		process.env.LIBVIRTD_PATH = config.libvirt_path;
		console.log(process.env.LIBVIRTD_PATH);
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
			volume.get_available_space(function(space){
				logging.log(logging.TYPES.DEBUG,space);
				// Check for proper response
				if (space!=null)
					{
						// Check if the allocation is greater than the available space
						if (sizekb < space)
							{
								
								try
								{
									logging.log(logging.TYPES.DEBUG,"Inside Try");
									// Get the connection string for the default hypervisor
									var hypervisor = vm_util.connect_hypervisor(config.hypervisors[default_hypervisor].libvirtstring);
									
									// Get the pool
									var pool = hypervisor.lookupStoragePoolByName('labproject');
									
									var path_to_disk = config.pool_path + "/" + name +'.' + type;
									var disk_name = name + '.' + type;
									
									// Make volume xml
									var disk_xml = '<volume><name>' + disk_name + '</name><allocation>0</allocation><capacity unit="K">' + sizekb + '</capacity><target><path>' + path_to_disk + '</path><format type="' + type + '"/></target></volume>';
									
									logging.log(logging.TYPES.DEBUG,"Vol XML: " + disk_xml);
									logging.log(logging.TYPES.DEBUG,"Before Create");
									var volume = pool.createVolume(disk_xml);
									
									callback({name: disk_name, path: path_to_disk, xml: disk_xml});
								}catch(e){
									
									callback({"Error": e});
								}
								
								
							}else{
								
								callback({"Error": 'Not enough space available'});
								return;
							}
					}else{
						callback({"Error": 'Could not get currently available disk space'});
					}
				
				
			});
			
		},
		remove_volume: function(name, callback){
					
			var hypervisor = connect(config.hypervisors[default_hypervisor].libvirtstring);
			
			try
			{
				var pool = hypervisor.lookupStoragePoolByName('labproject');
				var volume = pool.lookupVolumeByName(name);
				volume.remove();
				callback(null);
			}catch(e){
				//console.log(e);
				callback({"Error": e});
				return;
			}
			
		},
		import_volume: function(name,path,callback){
			
		},
		clone_volume: function(name,new_name,callback){
			
		},
		get_available_space: function(callback){
			try
			{
				logging.log(logging.TYPES.DEBUG,exec);
				exec('df -h ' + config.pool_path, function(err, resp, stderr){ 
					
				if (err||stderr)
					{
						logging.log(logging.TYPES.CODE_ERROR,err);
						callback({"Error":err});
					}else{
							
						logging.log(logging.TYPES.DEBUG,"Good");
						
						var resp_array = resp.split(/\n/);
						var line_array = resp_array[1].split(' ');
						var available = line_array[3];
						callback(available);
						
					}
				}); 
			}catch(e){
				
			}
			
			
		}
	}

var device = {
	get_hypervisor_devices: function(hypervisor_string,callback){
		
		// Get the hypervisor connection string
		var hypervisor_string = get_connection_string(hypervisor_string);
		
		// Get the hypervisor
		var hypervisor = new libvirt.Hypervisor(hypervisor_string);
		
		var inactive_domains = hypervisor.getDefinedDomains();
		//console.log(inactive_domains);
		var active_domains = hypervisor.getActiveDomains();
		//console.log(active_domains);
		
		callback({inactive: inactive_domains,active: active_domains});
	},
	get_device_info: function(uuid,callback){
		if (uuid.trim() == "")
			{
				// Error out here
			}else{
				database.findOne('registered_devices',{uuid:uuid},function(result){
					if (result&&result.ERROR )
						{
							console.log("Database Error: ", result.ERROR)
							callback(null); 
						}else{
							callback(result)
						}
					
				});
			}
		
	},
	new_device: function(vm_config,callback){
		
		
		
		// Check architecture
		if (ARCH=='ia32')
			{
				if (vm_config.platform=='32bit')
					{
						// Okay
						vm_platform = vm_config.platform;
					}else if(vm_config.platform=='64bit'){
						callback({ERROR: {message: 'Cannot make a 64-bit virtual machine on a 32-bit system'}});
						return;
					}else{
						callback({ERROR: {message: 'Invalid platform'}});
						return;
					}
			}else if (ARCH=='x64'){
				console.log("inside");
				if (vm_config.platform=='64bit'||vm_config.platform=='32bit')
					{
						// Okay
						vm_platform = vm_config.platform;
					}else{
						callback({ERROR: {message: 'Invalid platform'}});
						return;
					}
			}else{
				callback({ERROR: {message: 'Platform not defined'}});
				return;
			}
		
		var vm_name = vm_config.name.replace(/[^a-zA-Z]/,"");;

		// Register the new device
		private_device.register_device(vm_name,function(name,uuid){
			
			
			
			var vm = {};
			
			if (vm_config.is_template)
			{
				if (vm_config.is_template!=false||vm_config.is_template!=true)
					{
						vm.is_template = false;
					}else{
						vm.is_template = vm_config.is_template;
					}
			}else{
				vm.is_template = false;
			}
			
			vm.uuid = uuid;
			vm.hypervisor = virt_util.validate_hypervisor(vm_config.hypervisor);
			vm.platform = vm_platform;
			
			vm.name = name;
			vm.description = vm_config.description.replace(/[^a-zA-Z ]/,"");
			vm.memory = convert_to_kilo(vm_config.ram);

			if (vm_config.cpus&&!isNaN(vm_config.cpus))
				{
					if (vm_config.cpus>os.cpus().length)
						{
							callback({ERROR: {message: 'Not enough CPUs'}});
							return;
						}else{
							vm.cpus = vm_config.cpus;
						}
					
				}else{
					vm.cpus = 1;
				}
			
			vm.disk_size =  convert_to_kilo(vm_config.disk_size);
			vm.disk_type = vm_config.disk_type
			vm.init_iso = vm_config.init_iso;
			
			var hypervisor_string = get_connection_string(vm.hypervisor);
			var hypervisor = new libvirt.Hypervisor(hypervisor_string);
			
			var capabilities = new xml_parser.XmlDocument(hypervisor.getCapabilities());
			var capabilities_guests = capabilities.childrenNamed('guest');
			//console.log(capabilities.childrenNamed('guest')) 
			
			vm.emulator = '';
			
			for(var i = 0;i < capabilities_guests.length && vm.emulator=='';i++)
				{
					var emulator_arch = capabilities_guests[i].valueWithPath("arch@name").toString();
					
					
					
					var emulator = capabilities_guests[i].valueWithPath("arch.emulator");
					
					if (emulator)
						{
							// Add emulator based on architecture
							if ((emulator_arch=="i686")&&(vm.platform.trim()=="32bit"))
								{
									vm.emulator = emulator;
								}else if (emulator_arch=='x86_64'&&vm.platform=='64bit'){
									vm.emulator = emulator;
								}else{
									callback({ERROR: {message: 'Platform not supported'}});
									return;
								}
						}
					
				}
			
			console.log(hypervisor.getNodeInfo())
			
		
			console.log("UUID: ",vm.uuid);
			volume.create_volume(vm.disk_size, "hd_" + vm.uuid, vm.disk_type,function(result,hd_path,hd_xml){
				var hd_xml = '';
				if (result&&result.ERROR)
					{
						callback(result);
						return;
					}
				
				vm.volume_name = result;
				
				// Create XML builder
				var root = xml_builder.create('domain',{},{},{headless:true});
				
				// Set the type
				root.att('type', vm.hypervisor);
				// Set the name
				root.ele('name', {}, vm.name);
				// Set the UUID
				root.ele('uuid', {}, vm.uuid);
				// Set the description
				root.ele('description', {}, vm.description);
				// Set the memory
				root.ele('memory', {'unit':'KiB'}, vm.memory);
				root.ele('currentMemory', {'unit':'KiB'}, vm.memory);
				
				root.ele('vcpu', {'placement':'static'}, vm.cpus);
				var os_ele = root.ele('os');
				os_ele.ele('type','hvm');
				if (vm.hypervisor=='xen')
					{
						//os_ele.ele('loader','/usr/lib/xen-4.1/boot/hvmloader');
					}
				os_ele.ele('boot',{'dev':'cdrom'});
				os_ele.ele('boot',{'dev':'hd'});
				
				// Set the features section
				var features_ele = root.ele('features');
				features_ele.ele('acpi');
				features_ele.ele('apic');
				features_ele.ele('pae');
				
				// Set reactions to shutdowns and restarts...
				root.ele('on_poweroff',{},'destroy');
				root.ele('on_reboot',{},'restart');
				root.ele('on_crash',{},'restart');

				// Set the devices
				var device_ele = root.ele('devices');
				
				if (vm.emulator)
					{
						device_ele.ele('emulator',{},vm.emulator);
					}
				
				// Set the mouse
				device_ele.ele('input',{'type':'tablet','bus':'usb'});
				
				var hd_device_ele = device_ele.ele('disk',{'type':'file','snapshot':'external', 'device':'disk'});
				hd_device_ele.ele('source',{'file': hd_path});
				hd_device_ele.ele('target',{'dev':'sda', 'bus':'sata'});
				console.log(hd_device_ele + "");
				
				var cdrom_device_ele = device_ele.ele('disk',{'type':'file', 'device':'cdrom'});
				//cdrom_device_ele.ele('source',{'file': hd_path});
				cdrom_device_ele.ele('driver',{'name':'file'});
				cdrom_device_ele.ele('target',{'dev':'hdb', 'bus':'ide'});
				cdrom_device_ele.ele('source',{'file': config.iso_path + "/" + vm.init_iso + ".iso"});
				cdrom_device_ele.ele('readonly');
				
				var graphics_device_ele = device_ele.ele('graphics',{'type':'rdp', 'port':'5000', "multiUser": "yes"});

				
				//<listen type='address' address='1.2.3.4'/>
				
				// <target dev='hda' bus='ide'/>
				
				//var hd_device = {type: 'hd', name: vm_name + '_hd', path: path};
				
				new Buffer("Hello World").toString('base64')			
				var full_xml = root.end({ pretty: true});
				
				
					console.log(root.end({ pretty: true}))
				
				try{
					var the_domain = hypervisor.defineDomain(full_xml);
					
					var libvirt_xml = the_domain.toXml([]);
					
					console.log(libvirt_xml);
					
					var insert_device_info = 
						{
							name: vm.name, 
							config: vm, 
							xml_config: new Buffer(libvirt_xml).toString('base64'), 
							hd: {attach_xml_confi_g: new Buffer(hd_device_ele + "").toString('base64'), volume_xml_config: new Buffer(hd_xml).toString('base64')}, 
							cd: {xml_config: new Buffer(cdrom_device_ele + "").toString('base64')},
							interfaces: {}, 
							is_template: vm.is_template
						}
					
					database.update("registered_devices",{uuid: vm.uuid}, {$set: insert_device_info} ,false,function(result){
						if (result&&result.ERROR)
							{
								volume.remove_volume(vm.volume_name,function(delete_result){
									callback({ERROR: result.ERROR});
									return;
								});
							}else{
								callback(null);
							}
					});
					
					
				}catch(e){
					console.log("Oops! Deleting Volume", e);
					volume.remove_volume(vm.volume_name,function(delete_result){
						callback({ERROR: result.e});
						return;
					});

					return;
				}
				
				
				
			
				
				
			}); 
			
			
		});
		
		
		
		

		
	  
	},
	save_device_xml: function (uuid, xml, callback){
		
	},
	set_device_desktop: function(hypervisor_string, uuid, config,callback){
		var hypervisor = connect(hypervisor_string);
		var domain = hypervisor.lookupDomainByUUID(uuid);
		var domain_xml = domain.toXml([]);
		
		var protocol = config.protocol;
		
		var domain_xml_parsed = new xml_parser.XmlDocument(domain_xml);
		
		var emulator = capabilities_guests[i].valueWithPath("arch.emulator");
		if(hypervisor_string=="vbox"&&protocol!='rdp')
			{
				
			}else if(hypervisor_string!="vbox"&&protocol=='rdp'){
				
			}else{
				
			}
	},
	add_drive: function(xml,callback){
	
	},
	add_cdrom_drive: function(config,callback){
		
	},
	add_hard_drive: function (config, callback){
		
	},
	remove_drive: function(){
		
	},
	remove_hard_drive: function(){
		
	},
	remove_cdrom_drive: function(){
		
	},
   /* 
	* Function: unregister_device
	* 
	* Created by: Jacob Hartman
	* 
	* Description: Unregisters the device with the given uuid by removing it from the database, 
	* DOES NOT DELETE THE VM FILES OR REMOVE IT FROM LIBVIRT
	* 
	* Input:
	*	uuid[string]: The UUID of the device to be unregistered		
	* 	callback[function]: Callback function		
	*     
	* Callback Function:
	*     Input:
	*     
	* Preconditions:
	*    - database module is imported
	*     
	* Postconditions:
	*    - None
	* 
	* Usage: 
	* 	virtualization.device.unregister_device(UUID, function(){})
	*/
	unregister_device: function (uuid,callback){
		database.remove('registered_devices',{uuid: uuid},function(result){
			callback();
		});
	},
	delete_device: function(hypervisor_string,uuid,callback){
		
		console.log("Hypervisor at Delete: ", hypervisor_string);
		
		var hypervisor = connect(hypervisor_string);
		
		// Get the domain
		var domain = hypervisor.lookupDomainByUUID(uuid);
		
		if (domain.isActive())
			{
				try
				{
					domain.shutdown();
				}catch (e){
					console.log("CATCH ME", e);
					throw new Error(e)
				}
				
			}
		
		// Delete the domain
		try
		{
			domain.undefine();
			callback();
		}catch (e){
			callback({ERROR: e});
		}
		
		
	},
	full_remove_device: function(uuid,callback){
		
		// Check if the vm is currently in use
		allocate_device.is_allocated(uuid,function(result){
			if (result===false)
				{
					device.get_device_info(uuid,function(device_info){
						// Check if the device is in the database
						if (!device_info)
							{
								callback(false, "Device not registered");
							}else{
								// Get the device's hypervisor
								var device_hypervisor = device_info.config.hypervisor;
								
								
								
								// Store a backup of the device's entry in case something fails
								var backup_device_info = device_info;						
								
								// Unregister the device
								device.unregister_device(uuid,function(result){
									// Delete the device from libvirt
									device.delete_device(device_hypervisor,uuid, function(){
										if (result && result.ERROR)
											{
												console.log("Error:", result.ERROR);
												database.
												callback(false, "Removal from Libvirt Failed");
											}else{
													// We successfully removed the device
													
													// Remove the associated volume
													volume.remove_volume(device_info.config.volume_name,function(result){
													callback(true);
													
												});
											}
										});
									
								});
								
								
								
								
							}
						
					});
				}else{
					
				}
		});
		
		
		
	
	},
	clone_device: function(){
		
	},
	import_device: function(){
		
	},
	start_device: function(uuid){
		
	},
	
};

var allocate_device = {
	is_allocated: function(uuid,callback){
		callback(false);
	},
	allocate: function(uuid,callback){
		
	},
	deallocate: function(uuid,callback){
		
	}
};

var private_device = {
	register_device: function(input_name,callback){
		
		private_device.set_device_name(input_name,function(name){
			var new_uuid = uuid.v1();
			
			
			database.insert('registered_devices',{uuid: new_uuid, name: name},function(result){
				if (result.ERROR)
					{
						if (result.ERROR.name == "MongoError" && result.ERROR.code == 11000)
							{
								private_device.register_device(name,callback);
							}else{
								throw new Error(result.ERROR);
							}
						
					}else{
						
						callback(name,new_uuid);
					}
			});
		});
		
		
	},
	set_device_name: function(name, callback){
		database.find('registered_devices',{name: name},{},function(result){
			console.log(result.length);
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

					var new_name = name.replace(/\(\d*\)/,increment)
					if (new_name==name)
						{
							new_name = name + "(1)";
						}
					console.log(new_name);
					
					private_device.set_device_name(new_name,callback);
					
				}else{
					callback(name);
				}
		});
	}
}


var vm_util = {
	register_new_vm: function(hypervisor_string, callback){
		
		// Create a new uuid
		var new_uuid = uuid.v1();
		
		// Attempt to insert the device
		database.insert('registered_devices',{ uuid: new_uuid, hypervisor: hypervisor_string, configured: false, ready: false },function(result){
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
	connect_hypervisor: function(hypervisor_string)
	{
		if (!hypervisor_string)
			{
				throw new Error("No hypervisor defined");
			}else{
				// Get the hypervisor string
				var hypervisor_string = vm_util.get_connection_string(hypervisor_string);
				
				
				// Get the hypervisor
				var hypervisor = new libvirt.Hypervisor(hypervisor_string);
				
				return hypervisor;
			}
	},
	get_connection_string: function(libvirtstring)
	{
		var hypervisor_string = '';
		if (libvirtstring=='xen')
			{
				hypervisor_string = libvirtstring + ':///';
			}else{
				hypervisor_string = libvirtstring + ':///session';
			}
		return hypervisor_string;
	},
	validate_hypervisor: function(name){
		if (name=='qemu'||name=='vbox'||name=='xen')
			{
				return name;
			}else{
				return false;
			}
	},
	convert_to_kilo: function(value,unit)
	{

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
}


var virt_util = {
	verify_uuid: function(uuid){
		virt_util.check_default_hypervisor();
		
		var hypervisors = config.hypervisors;
		for (var i = 0;i < hypervisors.length; i++)
			{
				if (hypervisors[i].enabled === true)
					{
						var hypervisor_string = get_connection_string(hypervisors[default_hypervisor].libvirtstring);
						console.log(hypervisor_string);
						try
						{
							var hypervisor = new libvirt.Hypervisor(hypervisor_string);
							return true;
						}catch(e) {
							return false;
						}
						
					}
			}
	},
	validate_hypervisor: function(name){
		if (name=='qemu'||name=='vbox'||name=='xen')
			{
				return name;
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
	check_default_hypervisor: function(){
		var hypervisors = config.hypervisors;
		var i =0;
		var done = false;
		
		while (i < hypervisors.length&&done===false)
			{
				if (hypervisors[i].enabled === true)
					{
					
						default_hypervisor = i;
						done = true;
						
					}
				i++;
			}
		
	}
}



function verify_pool()
	{
		virt_util.check_default_hypervisor();
		
		var hypervisor_string = get_connection_string(config.hypervisors[default_hypervisor].libvirtstring);
		var hypervisor = new libvirt.Hypervisor(hypervisor_string);
		try
		{
			var pool = hypervisor.lookupStoragePoolByName('labproject');
		}catch(e){
			//console.log('Nonexistant');
			var result = hypervisor.defineStoragePool(pool_xml);
			result.start();
		}
	}



function convert_to_kilo(value)
	{
		if (isNaN(value))
			{
				
				var space_unit = value.substring(value.length-1,value.length);
				var space_number = value.substring(0,value.length-1);
				
				
				var multiplier = 1;
				if (space_unit=='M')
					{
						multiplier = 1024;
					}else if (space_unit =='G'){
						multiplier = 1048576;
					}else if(space_unit == 'T'){
						multiplier = 1073741824;
					}else if(space_unit == 'P'){
						multiplier = 1099511627776;
						
					}
				return space_number * multiplier;
				//console.log("not");
			}else{
				
			}
	}


function get_connection_string(libvirtstring)
	{
		var hypervisor_string = '';
		if (libvirtstring=='xen')
			{
				hypervisor_string = libvirtstring + ':///';
			}else{
				hypervisor_string = libvirtstring + ':///session';
			}
		return hypervisor_string;
	}

function connect(hypervisor_string)
	{
		if (!hypervisor_string)
			{
				throw new Error("No hypervisor defined");
			}else{
				// Get the hypervisor string
				var hypervisor_string = get_connection_string(hypervisor_string);
				
				
				// Get the hypervisor
				var hypervisor = new libvirt.Hypervisor(hypervisor_string);
				
				return hypervisor;
			}
	}


// Set the default hypervisor
var hypervisors = config.hypervisors;
var i = 0;
var done = false;
while (i < hypervisors.length && done === false)
	{
		if (hypervisors[i].enabled === true&&default_hypervisor=='')
			{
				console.log('Default is ' + i);
				default_hypervisor = i;
				done = true;
			}
		i++;
	}

// Verify the labproject pool exists
verify_pool();

console.log("Finishing virtualization init");


function virtual_machine(uuid)
	{
		var self = this;
		
		/*
		 * Libvirt Connection Variables
		 */ 
		
		// Stores the connection to the hypervisor
		var vm_hypervisor;
		// Stores the libivrt string of the hypervisor
		var vm_hypervisor_string;
		
		/*
		 * Private VM Variables
		 */ 
		
		// Stores the name of the vm
		var vm_name = "";
		// Stores the uuid of the vm
		var vm_uuid = "";
		// Stores an array of hard drives attached to the vm
		var vm_hd = [];
		// Stores an array of cdrom drives attached to the vm
		var vm_cd = [];
		// Stores the information for the vm display
		var vm_display = {protocol: "", settings: {}};
		// Stores the xml of the vm
		var vm_xml = '';
		
		
		if (uuid)
			{
				vm_uuid = uuid;
			}else{
				self = null;
				return;
			}
		

		
		
		var verify_platform = function(){
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
		
		var check_hypervisor = function(){
			
		};
		
		self.load = function(callback){
			logging.log(logging.TYPES.DEBUG,vm_uuid);
			// Query database for vm data
			database.findOne('registered_devices',{uuid: vm_uuid},function(data){
				logging.log(logging.TYPES.DEBUG,data);
				// Check if data exists
				if (data!=null)
					{
						if (!data.hypervisor)
							{
								logging.log(logging.TYPES.VM_ERROR,"Hypervisor not set!");
								callback(null);
							}else{
								vm_hypervisor = vm_util.connect_hypervisor(data.hypervisor);
								vm_hypervisor_string = data.hypervisor;
								console.log(": ", vm_hypervisor_string);
								if (data.configured === false)
									{
										logging.log(logging.TYPES.DEBUG,"Not Yet Configured");
									}else{
										// Load data into object
									}
							}
					}else{
						logging.log(logging.TYPES.VM_ERROR,"Data Not Found!");
						callback(null);
					}
				callback(self);
			});
		};
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

						self.setName(new_name,callback);
						
					}else{
						database.update("registered_devices",{uuid: uuid},{$set: {name: name}},false,function(result){
							if (result&&result.ERROR)
								{
									logging.log(logging.TYPES.CODE_ERROR,result.ERROR);
									callback(false);
								}else{
									
									vm_name = name;
									logging.log(logging.TYPES.DEBUG,"Name: " + vm_name);
									callback(true);
								}
						});
					}
			});
		},
		self.getHypervisor = function(){
			return vm_hypervisor_string;
		};
		self.getConfig = function(){
			
		};
		self.setConfig = function(config){
			
		};
		var getHypervisorEmulator = function(){
			
			// Get the capabilities XML from libvirt for the hypervisor
			var capabilities = new xml_parser.XmlDocument(vm_hypervisor.getCapabilities());
			var capabilities_guests = capabilities.childrenNamed('guest');
			
			for(var i = 0;i < capabilities_guests.length;i++)
					{
						var emulator_arch = capabilities_guests[i].valueWithPath("arch@name").toString();
						
						var emulator = capabilities_guests[i].valueWithPath("arch.emulator");
						
						
						
						if (emulator)
							{
								// Add emulator based on architecture
								if ((emulator_arch=="i686")&&(self.config.platform=="32bit"))
									{
										return emulator;
									}else if (emulator_arch=='x86_64'&&self.config.platform=='64bit'){
										return emulator;
									}else{
										return false;
									}
							}else{
								return false;
							}
						
					}
			
		};
		var createDomainXml = function(){
			
			var vm_memory = vm_util.convert_to_kilo(self.config.memory.value, self.config.memory.unit);
			
			if (vm_memory != false)
				{
					// Create XML builder
					var root = xml_builder.create('domain',{},{},{headless:true});
					
					// Set the type
					root.att('type', vm_hypervisor_string);
					// Set the name
					root.ele('name', {}, vm_name);
					// Set the UUID
					root.ele('uuid', {}, vm_uuid);
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
					if (vm_hypervisor_string=='xen')
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
					vm_emulator = getHypervisorEmulator();
					console.log(vm_emulator)
					// Add the emulator if there is one
					if (vm_emulator!==false)
						{
							device_ele.ele('emulator',{},vm_emulator);
						}
					
					// Add the vm input method
					device_ele.ele('input',{'type':'tablet','bus':'usb'});
					
					// Add the hard disks
					for(var i = 0;i < vm_hd.length;i++)
						{
							if (i > 123)
								{
									
								}else{
									var hd_object = vm_hd[i];
									var hd_letter = String.fromCharCode(97 + i);
									var hd_device_ele = device_ele.ele('disk',{'type':'file','snapshot':'external', 'device':'disk'});
									hd_device_ele.ele('source',{'file': hd_object.disk_path});
									hd_device_ele.ele('target',{'dev':'sd' + hd_letter, 'bus':'sata'});
									console.log(hd_device_ele + "");
								}
						}
						
					// Add the CDrom drives
					for(var i = 0;i < vm_cd.length;i++)
						{
							
						}
					
					
					return root.end({ pretty: true});
					
				}else{
					return false;
				}
			
			
		}
		self.save = function(callback){
			
			if (typeof callback != "function")
				{
					logging.log(logging.TYPES.CODE_ERROR,"No callback defined");
					return;
				}
			
			// Verify config contents
			var is_valid_platform = verify_platform();
			
			
			var valid_units = ['K','M','G','T','P'];
			var valid_os_types = ['linux','windows','bsd','other'];
			
			
			
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
					self.config.description = self.config.description.replace(/[^a-zA-Z0-9_()\[\] \\-]/g,"");
					
					// Create the XML
					
					
					
					var vmXML = createDomainXml();
					
					logging.log(logging.TYPES.DEBUG, vmXML);
					
					if (vmXML!==false)
						{
							logging.log(logging.TYPES.DEBUG,"Hi");
							try
							{
								var the_domain = vm_hypervisor.defineDomain(vmXML);
					
								var libvirt_xml = the_domain.toXml([]);
								
								logging.log(logging.TYPES.DEBUG,libvirt_xml);
								
							}catch(e){
								logging.log(logging.TYPES.VM_ERROR,e);
							}
							
						}else{
							logging.log(logging.TYPES.CODE_ERROR,"Ouch!");
							callback()
						}
					
					
					
				}
			
		};
		self.drives = {
			addCDDrive : function(config,callback){
				
			},
			addHardDrive : function(config,callback){
				
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
										disk_name = "default_hd_" + vm_uuid;
									}else{
										disk_name = config.name + "_hd_" + vm_uuid;
									}
								
								
								
								volume.create_volume(size, disk_name, config.type,function(result){
									if (result&&result.Error)
										{
											logging.log(logging.TYPES.DEBUG,"Got Error");
											callback(result);
										}else if (result&&result.name&&result.path&&result.xml){
											var disk_object = {
												disk_name: result.name,
												disk_path: result.path,
												disk_xml: new Buffer(result.xml).toString('base64')	
											};
											vm_hd.push(disk_object);
											callback();
										}
								});
							}
					}
				
			},
			removeHardDrive: function(name,callback){
				volume.remove_volume(name,callback);
			},
			addInterface : function(config,callback){
				
			},
			getDrives : function(callback){
				
			},
		};
		var addDisk = function(config,callback){
			
		};
		
		self.state = {
			shutdown: function(){
				
			},
			start: function(){
				
			},
			getState: function(){
				
			}
		}
		self.snapshot = {
			takeSnapshot: function(){
				
			},
			restoreSnapshot: function(){
				
			}
		} 	
		self.permissions = {
			setPermissions: function(){
				
			},
			getPermissions: function(){
				
			}
		}
		
		self.remove = function(callback){
			var domain = vm_hypervisor.lookupDomainByUUID(vm_uuid);
			
			// Check if the VM is running
			if (domain.isActive())
				{
					callback({"Error":"Virtual Machine is currently running"});
				}
			
			// Remove the VM from the database
			database.remove('registered_devices', {uuid: vm_uuid}, function(result){
				

				// Delete the domain
				try
					{
						domain.undefine();
					}catch (e){
						callback({"Error": e});
					}
				
				// Remove all hard disks
				for(var i = 0;i < vm_hd.length;i++)
					{
						logging.log(logging.TYPES.DEBUG, "Removing: " + vm_hd[i].disk_name);
						var toRemove = vm_hd[i].disk_name;
						self.drives.removeHardDrive(toRemove,function(result){
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
		};
	}

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
	device: device,
	iso_manager: iso_manager,
	getVM: function(uuid,callback){
		if (uuid&&uuid.trim()!='')
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
