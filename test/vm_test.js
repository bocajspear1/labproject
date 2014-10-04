var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";

var lab_manager = require(LABPROJECT_SERVER_LIBS + "/managers/lab_manager");
var database = require(LABPROJECT_SERVER_LIBS +"/util/database");

var should = require("should");

var test_lab = {
	name: "testlab",
	description: "Testing Lab"
};

describe('VM (By manager):', function (){
	describe('Create a VM (By manager):', function(){
		
		var Current_User = null;
		
		it('should be a place holder', function(done){

			// Do nothing
		});
		
	});
});

