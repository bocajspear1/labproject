var logger = require('./server/lib/server_log');

var virt = require('./server/lib/virtualization');

//c2eba750-9aa2-11e3-b53c-dd9f8ba57579
var machine = new virt.getVM('bff1b980-9aa8-11e3-85c1-51f575b49ee4', function(vm){
		
		
		vm.remove(function(){
			logger.log(logger.TYPES.NOTICE,"VM Removed");	
		});
		
	
	
	
});


