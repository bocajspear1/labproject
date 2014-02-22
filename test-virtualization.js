var logger = require('./server/lib/server_log');

var virt = require('./server/lib/virtualization');


var machine = new virt.newVM("Test", 'qemu', function(vm){
	vm.config.memory.value = 1;
	vm.config.memory.unit = 'G';
	vm.config.description = "Test Description";
	vm.config.platform = '32bit';
	vm.config.os_type = 'linux';
	
	vm.drive.addHardDrive({
		name: "default",
		size: {value: "5", unit: "G"},
		type: 'vdi'
	}, function(){
		vm.drive.addCDDrive({
			name: "cd1",
			init_disk_path: '/home/jacob/labproject-isos/test.iso'
		}, function(){
			logger.log(logger.TYPES.DEBUG,"Made it to Save");
			vm.save(function(result){
				if (result&&result.Error)
					{
						logger.log(logger.TYPES.CODE_ERROR,result.Error);
					}
					vm.remove(function(){
						logger.log(logger.TYPES.NOTICE,"VM Removed");	
					});
					
			});
		});
		
	});
	
	
	
	
});


