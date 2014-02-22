var logger = require('./server/lib/server_log');

var virt = require('./server/lib/virtualization');
var runsync = require('./server/lib/runsync');




function sendback(input)
	{
		console.log(input)
		return;
	}

var machine = new virt.newVM("Test", 'vbox', function(vm){
	vm.config.memory.value = 1;
	vm.config.memory.unit = 'G';
	vm.config.description = "Test Description";
	vm.config.platform = '32bit';
	vm.config.os_type = 'linux';
	
	runsync.next(function(callback){
			vm.drive.addHardDrive({
				name: "default",
				size: {value: "5", unit: "G"},
				type: 'vdi'
			}, function(result){
				callback()
			});
	});
	
	runsync.next(function(callback){
		vm.drive.addCDDrive({
			name: "cd1",
			init_disk_path: '/home/jacob/labproject-isos/test.iso'
		}, function(){
			callback()
		});
	});
	
	runsync.run(function(){
		vm.save(function(result){
			if (result&&result.Error)
				{
					logger.log(logger.TYPES.CODE_ERROR,result.Error);
				}
			sendback(vm.getUUID());
		});
	});
	
	
	

});


