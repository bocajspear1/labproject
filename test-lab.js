var lab =require('./server/lib/lab_manager');
lab.cleanup();

lab.get_current_labs('admin',function(labs){
	if (labs)
		{
			console.log("Labs: ", labs);
		}else{
			console.log("No Labs");
		}
});

lab.new_lab('tester_lab','admin', function(result){
	if (result.error)
		{
			console.log(result.error);
		}
});

lab.new_lab('tester_lab','bobby', function(result){
	if (result.error)
		{
			console.log(result.error);
		}
});

lab.delete_lab('tester_lab','admin', function(result){
	if (result.error)
		{
			console.log(result.error);
		}
});

lab.devices.allocate_device("","","", function(result){
	
});
