var virt = require('./server/lib/virtualization');
var database = require('./server/lib/database');

console.log("Available: ",virt.get_available_hypervisors());
/*
virt.iso_manager.delete_iso('billy',function(result){
	if (result.error)
		{
			console.log(result.error);
		}
});

var new_iso_info = 
{
	name: 'test',
	type: 'linux',
	version: {major: 1,minor: 1,extra: 15}
}*/

/*virt.iso_manager.new_iso('http://www.tinycorelinux.net/4.x/x86/release/Core-4.7.7.iso', new_iso_info ,{method:'md5',hash:'f610b20a97801c937ffb791443a32640'}, function(result){
	console.log(result);
	virt.iso_manager.get_stored_isos(function(result){
		console.log(result);
	});

});*/

var new_device_config =
{
	hypervisor: 'vbox',
	platform: '32bit',
	name: 'tester01',
	vm_group: 'test',
	description: 'A Test device',
	init_iso: 'test',
	ram: '1G',
	disk_size: '1G',
	disk_type: 'vdi',
	type: 'linux',
	permissions: [{type: 'group', group: 'GLOBAL', access:'true', modify: false}],
	display: 'rdp',
	is_template: true
}
/*
virt.device.new_device(new_device_config,function(result){
		if (result&&result.ERROR)
			{
				console.log(result.ERROR.message);
			}else{
				virt.device.get_hypervisor_devices('vbox',function(domains){
					console.log(domains);
				});

			}
})

*/


/*virt.volume.create_volume(2048,'test','qed',function(result){
	
});*/

var available = virt.get_available_hypervisors();
for (var i = 0;i < available.length;i++)
	{
		virt.get_hypervisor_devices(available[i].id,function(result){
			for (var j = 0;j< result.length;j++)
				{
					virt.getVM(result[j].uuid,function(vm){
						if (vm!=null)
							{
								vm.remove(function(){
									
								});
							}
						
					});
				}
		});
	}




console.log(virt.get_libvirt_version())
console.log("Got to the end");

