var logger = require('./server/lib/server_log');

var virt = require('./server/lib/virtualization');


virt.getVM('bff1b980-9aa8-11e3-85c1-51f575b49ee4', function(vm){
		
		vm.state.start(function(result){
			if (result===true)
				{
					logger.log(logger.TYPES.NOTICE,"Action Completed");	
					
					setTimeout(function(){
						logger.log(logger.TYPES.NOTICE,"Running Timeout");	
						vm.state.shutdown(false,function(result){
							logger.log(logger.TYPES.NOTICE,"After Shutdown");	
							if (result===true)
								{
									logger.log(logger.TYPES.NOTICE,"Action 2 Completed");
								}else{
									logger.log(logger.TYPES.CODE_ERROR,result);	
								}
						});
						
					},5000);
					
					
				}else{
					logger.log(logger.TYPES.CODE_ERROR,result);	
				}
		});
		
		/*vm.snapshot.removeSnapshot('tester',function(result){
			if (result===true)
				{
					logger.log(logger.TYPES.NOTICE,"Action Completed");	
				}else{
					logger.log(logger.TYPES.CODE_ERROR,result);	
				}
			});*/
			
		/*('testerdfdf',function(result){
			if (result===true)
				{
					logger.log(logger.TYPES.NOTICE,"Snapshot Created");	
				}else{
					logger.log(logger.TYPES.CODE_ERROR,result);	
				}
			return;

		});*/
		
});


