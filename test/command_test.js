
var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";

var command = require(LABPROJECT_SERVER_LIBS + '/util/command');
var callback_error = require(LABPROJECT_SERVER_LIBS + '/util/error').callback_error;
var error_type = require(LABPROJECT_SERVER_LIBS + '/util/error').error_type;



var should = require("should");

describe('command Object:', function(){
	
	describe('Run Command', function(){
	  
		it('should run the command with no errors', function(done){
			
			command.run("ls", ["-la"], function(stdout,stderr){
				stdout.should.not.be.instanceof(callback_error);
				stdout.should.be.instanceof(Array);
				
				stderr.should.be.instanceof(Array);
				stderr[0].should.equal("");
				
				done();
			});
			
		});
		
		it('should run the command with error from shell', function(done){
			
			command.run("ls", ["-z"], function(stdout,stderr){
				
				
				stdout.should.be.instanceof(callback_error);
				stdout.should.not.be.instanceof(Array);
				
				(stderr === null).should.be.true;

				
				done();
			});
			
		});
		
		it('should not run the command (second param is not array)', function(done){
			
			command.run("ls", "-la", function(stdout, stderr){
				stdout.should.be.instanceof(callback_error);
				stdout.should.not.be.instanceof(Array);
				done();
			});
			
		});
		
		it('also should not run the command', function(done){
			
			command.run(";", [], function(stdout, stderr){
				stdout.should.be.instanceof(callback_error);
				stdout.should.not.be.instanceof(Array);
				done();
			});
			
		});
		
	});

})
