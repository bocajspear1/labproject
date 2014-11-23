var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";

var database = require(LABPROJECT_SERVER_LIBS + '/util/database');


var should = require("should");


var needed_collections = [	'not existant',
							'current_devices',
							'device_groups',
							'groups',
							'isos',
							'labs',
							'networks',
							'node_sessions',
							'registered_devices',
							'registered_switches',
							'snapshots',
							'system.indexes',
							'test',
							'user_session',
							'users']


describe('Database Object:', function(){
	describe('Database functions', function(){
	  
		it('should show insert works', function(done){
			
			result = "";
			
			try
			{
				database.insert("test", [{"key": "value"}, {"key": "value"}], function(result){
					result.should.an.Array;
					result.length.should.equal(2);
					done()
				});
			}catch (e){
				result = e;
			}
			result.should.be.equal("");
			
			
		});
		
		it('should show find works', function(done){
			
			result = "NoError";
			
			try
			{
				database.find("test", {"key": "value"}, {},function(result){
					result.should.be.Array;
					result.length.should.be.equal(2);
					done()
				});
			}catch (e){
				result = e.message;
			}
			result.should.be.equal("NoError");
			
			
		});
		
		it('should show findOne works', function(done){
			
			result = "NoError";
			
			try
			{
				database.findOne("test", {"key": "value"}, function(result){
					result.should.be.Object;
					result.should.have.property("_id");
					result.should.have.property("key");
					done()
				});
			}catch (e){
				result = e.message;
			}
			result.should.be.equal("NoError");
			
			
		});
		
		it('should show remove works', function(done){
			
			result = "NoError";
			
			try
			{
				database.remove("test", {"key": "value"}, function(result){
					
					result.should.be.Number;
					result.should.equal(2);
					database.find("test", {"key": "value"}, {},function(result){
						result.should.be.Array;
						result.length.should.be.equal(0);
						done()
					});
				});
			}catch (e){
				result = e.message;
			}
			result.should.be.equal("NoError");
			
			
		});
		
		it('should show produce error when no callback given', function(){
			
			result = "NoError";
			
			try
			{
				database.remove("test", {"key": "value"});
			}catch (e){
				result = e.message;
			}
			result.should.be.equal("No callback defined");
			
			
		});
	 });
});
