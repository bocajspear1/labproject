var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";

var sanitize = require(LABPROJECT_SERVER_LIBS + '/util/sanitize');

var database = require(LABPROJECT_SERVER_LIBS + '/util/database');

var callback_error = require(LABPROJECT_SERVER_LIBS + '/util/error').callback_error;
var error_type = require(LABPROJECT_SERVER_LIBS + '/util/error').error_type;

var switch_manager = require(LABPROJECT_SERVER_LIBS + '/managers/switch_manager');

var exec = require('child_process').exec;

describe('Switch Manager:', function(){
	describe('Switch object basics', function(){
	  
		var sw_id = null;
	  
		it('should create object and add switch to database', function(done){
			switch_manager.new_switch(8, function(vswitch){
				vswitch.should.be.instanceof(switch_manager.switch_obj);
				
				sw_id = vswitch.get_uuid();
				
				database.findOne("registered_switches", {"sw_id": sw_id}, function(result){
					
					
					result.should.not.be.instanceof(callback_error);
					
					result.should.be.type('object');
					(result.port_count).should.equal(8);
					done()
				});
				
				
			});
			
		});
		
		it('should start the switch', function(done){

			switch_manager.get_switch(sw_id, function(vswitch){
				

				vswitch.should.be.instanceof(switch_manager.switch_obj);
				
				vswitch.state.start(function(result){
					console.log(vswitch.is_on());
					child = exec("ovs-vsctl list-br" , function (error, stdout, stderr) {
						(error === null).should.be.true;
						
						var list = stdout.split(/\n/);
						
						var okay = false;
						
						for (i in list)
						{
							if (list[i] == sw_id)
								{
									okay = true;
								}
						}
						
						okay.should.be.true;
						done();
					});
				});
				
				
			});
			
		});
		
			
		it('should create ports for testing', function(done){
			child = exec("tunctl -t test0; ifconfig test0 up; tunctl -t test1; ifconfig test1 up; tunctl -t test2; ifconfig test2 up" , function (error, stdout, stderr) {
					(error === null).should.be.true;
					done();
			});
			
		});
		
		it('should add port to switch (access by name)', function(done){

			switch_manager.get_switch(sw_id, function(vswitch){

				vswitch.should.be.instanceof(switch_manager.switch_obj);
				
				var port = vswitch.port("fa0/1");
				port.connect_port("test0");
				port.set_state(true);

				
				vswitch.update_port_config(function(result){
					
					
					if (result instanceof callback_error)
						{
							console.log("Error: ", result.details());
						}
						
					result.should.not.be.instanceof(callback_error);
					
					/*child = exec("ovs-vsctl show" , function (error, stdout, stderr) {
							console.log(stdout);
					});*/
					
					child = exec("ovs-vsctl iface-to-br test0" , function (error, stdout, stderr) {
							console.log(error);
							(error === null).should.be.true;

							var test_id = stdout.split(/\n/);
							
							test_id[0].should.equal(sw_id);
							done();
					});
					
				});

				
			});
			
		});
		
		it('should change the port', function(done){

			switch_manager.get_switch(sw_id, function(vswitch){

				vswitch.should.be.instanceof(switch_manager.switch_obj);
				
				var port = vswitch.port("fa0/1");
				port.connect_port("test1");
				port.set_state(true);

				
				vswitch.update_port_config(function(result){
					
					
					if (result instanceof callback_error)
						{
							console.log("Error: ", result.details());
						}
						
					result.should.not.be.instanceof(callback_error);
					
					child = exec("ovs-vsctl show" , function (error, stdout, stderr) {
							console.log(stdout);
					});
					
					child = exec("ovs-vsctl iface-to-br test1" , function (error, stdout, stderr) {
							console.log(error);
							(error === null).should.be.true;

							var test_id = stdout.split(/\n/);
							
							test_id[0].should.equal(sw_id);
							
							child2 = exec("ovs-vsctl iface-to-br test0" , function (error, stdout, stderr) {
									console.log(error);
									(error === null).should.be.false;


									done();
							});
							
							
					});
					
				});

				
			});
			
		});
		
		it('should change the vlan', function(done){

			switch_manager.get_switch(sw_id, function(vswitch){

				vswitch.should.be.instanceof(switch_manager.switch_obj);
				
				var port = vswitch.port("fa0/1");
				port.set_vlan(2);
				console.log("connected to :" , port.connected_to());
				
				vswitch.update_port_config(function(result){
					
					
					if (result instanceof callback_error)
						{
							console.log("Error: ", result.details());
						}
						
					result.should.not.be.instanceof(callback_error);
					
					child = exec("ovs-vsctl show" , function (error, stdout, stderr) {
							console.log(stdout);
					});
					
					child = exec("ovs-vsctl list port test1" , function (error, stdout, stderr) {
							console.log(error);
							(error === null).should.be.true;

							var lines = stdout.split(/\n/);
							
							var okay = false;
							
							for (var i = 0; i < lines.length; i++)
								{
									var test = lines[i].split(":");
									if (test.length == 2)
										{
											var key = test[0].trim();
											var value = test[1].trim();
											
											if (key == "tag" && value == "2")
												{
													okay = true;
												}
										}
									
									
									
								}
							
							okay.should.be.true;
							done();
					});
					
				});

				
			});
			
		});
		
		it('should stop the switch', function(done){
			
			console.log("Stopping switch");
			
			switch_manager.get_switch(sw_id, function(vswitch){
				vswitch.should.be.instanceof(switch_manager.switch_obj);
				
				console.log("-- Got Switch obj");
				
				
				vswitch.state.stop(function(result){
					
					
					console.log("-- Stop callback");
					var the_command = "ovs-vsctl list-br"
					
					var child = exec(the_command , function (error, stdout, stderr) {
						(error === null).should.be.true;
						
						var list = stdout.split(/\n/);
						
						var okay = false;
						
						for (i in list)
						{
							if (list[i] == sw_id)
								{
									okay = true;
								}
						}
						
						okay.should.be.false;
						done();
					});
				});
				
				
			});
			
		});
		
		
		it('should remove switch instance from database', function(done){
			switch_manager.get_switch(sw_id, function(vswitch){
				
				
				vswitch.should.be.instanceof(switch_manager.switch_obj);
				vswitch.remove(function(){
					database.findOne("registered_switches", {"sw_id": sw_id}, function(result){
						
						(result === null).should.be.true;
						
						
						done();
					});
				});

				
			});
			
		});
	});
});
