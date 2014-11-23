var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";

var lab_manager = require(LABPROJECT_SERVER_LIBS + "/managers/lab_manager");
var database = require(LABPROJECT_SERVER_LIBS +"/util/database");

var should = require("should");

var test_lab = {
	name: "testlab",
	description: "Testing Lab"
};

describe('Lab (By manager):', function (){
	describe('Create new lab (By manager):', function(){
		
		var Current_User = null;
		
		it('should create a new lab', function(done){

			lab_manager.
		});
		
		it('should fail to create a new lab', function(done){

			user_manager.new_user({username: "should_not"}, function(u_obj){
				
					u_obj.Error.error_message.should.equal("DATA_NOT_SET");
					done();
					
			});
		});
		
		it('show user is in database', function(done){
			database.findOne("users",{username: test_user.username}, function(result){
				if (result&&result.Error)
					{
						done(u_obj.Error);
					}else{
						result.should.be.ok;
						done();
					}
			});
		});
		
		it('should get a new user object', function(done){
			user_manager.get_user(test_user.username, function(result){
				result.should.be.ok;
				
				Current_User = result;
				done();
			});
		});
		
		it('should remove the user object', function(){
			Current_User.remove();
		});
		
		it('should show that user is no longer available', function(done){
			user_manager.get_user(test_user.username, function(result){
				should(result).not.be.okay;
				done();
			});
		});
		
		it('should show that user is no longer available in database', function(done){
			database.findOne("users",{username: test_user.username}, function(result){
				if (result&&result.Error)
					{
						done(u_obj.Error);
					}else{
						should(result).not.be.okay;
						done();
					}
			});
		});
		
	});
});

