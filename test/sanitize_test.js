var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";


var sanitize = require(LABPROJECT_SERVER_LIBS + '/util/sanitize');

var should = require("should");

describe('sanitize Object:', function(){
	
	describe('sanitize functions', function(){
	  
		var input = "-_123ABCDefgh!@#$;<div></div>\nhithere()'\"";
	  
		it('alphanum_string should only allow alpha-numeric characters', function(){
			
			var new_input = sanitize.alphanum_string(input);
			
			new_input.should.equal("123ABCDefghdivdivhithere");
			
		});
		
		it('simple_string should only allow alpha-numeric characters and - and _', function(){
			
			var new_input = sanitize.simple_string(input);
			
			new_input.should.equal("-_123ABCDefghdivdivhithere");
			
		});
		
		it('simple_text should only allow simple text, no html', function(){
			
			var new_input = sanitize.simple_text(input);
			
			new_input.should.equal("-_123ABCDefgh!@#$\nhithere()'\"");
			
		});
		
		it('path should only allow path characters', function(){
			
			var l_input = "/path/to/something-_123ABCDefgh!@#$\nhithere()'\""
			
			var new_input = sanitize.path(l_input);
			
			new_input.should.equal("/path/to/something-_123ABCDefghhithere");
			
		});
		
		it('parameter should only allow parameter characters', function(){
			
			var l_input = "-a b !@#$% 1 2 /<>\"':"
			
			var new_input = sanitize.parameter(l_input);
			
			new_input.should.equal("-ab12");
			
		});
		
	
		
	  });
	  
})
