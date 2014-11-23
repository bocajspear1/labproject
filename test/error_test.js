var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";

var callback_error = require(LABPROJECT_SERVER_LIBS + '/util/error').callback_error;
var error_type = require(LABPROJECT_SERVER_LIBS + '/util/error').error_type;

var should = require("should");

describe('Error Object:', function(){
	
	describe('error_type', function(){
	  
		it('should be a number of objects', function(){
			
			error_type.should.be.type('object');
			error_type.should.have.properties('ERROR', "INVALID_VM_SETTING");
			
		});
		
	  })
	
		var error = null;
		var invalid_error = null;
		describe('new', function(){

			it('should create a new callback_error object', function(){
				
				error = new callback_error(error_type.ERROR, "Test Error");
				
				error.should.be.instanceof(callback_error);
				
			});

			it('should not create a new callback_error object (Invalid type)', function(){
				
				var message = "";
				
				try
				{
					
					invalid_error = new callback_error(error_type.NOT_EXISTANT, "Test Error");
					
				}catch (e){
					message = e.message;
				}
				message.should.equal("An error occured while handling an error: Invalid error type");

			});


			it('should not create a new callback_error object (No message)', function(){
				
				var message = "";
				
				try
				{
					invalid_error = new callback_error(error_type.ERROR);
				}catch (e){
					message = e.message;
				}
				message.should.equal("An error occured while handling an error: A message must be set");
				
			});
		})
	  
	  describe('object test', function(){

		
		
		it('should have a string returned from message()', function(){
			
			var error = new callback_error(error_type.ERROR, "Test Error");
			
			var message = error.message()
			
			message.should.be.a.String;
			
		});
		
		it('should have a int returned from priority()', function(){
			
			var error = new callback_error(error_type.ERROR, "Test Error", {}, 3);
			
			var priority = error.priority()
			
			priority.should.be.a.Number;
			
		});
		
		it('should have a default value of priority() of 4', function(){
			
			var error = new callback_error(error_type.ERROR, "Test Error");
			
			var priority = error.priority()
			
			priority.should.be.exactly(4);
			
		});
		
		it('should have a string returned from type_name()', function(){
			
			var error = new callback_error(error_type.ERROR, "Test Error");
			
			var type_name = error.type_name()
			
			type_name.should.be.a.String;
			
		});
		
		it('should have a value of "INVALID_VM_SETTING" returned from type_name()', function(){
			
			var error = new callback_error(error_type.INVALID_VM_SETTING, "Test Error");
			
			var type_name = error.type_name()
			
			type_name.should.be.equal("INVALID_VM_SETTING");
			
		});
		
	  })
	  
	  
})
