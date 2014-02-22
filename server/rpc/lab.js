var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = LABPROJECT_BASE + "/server/lib";

var database = require(LABPROJECT_SERVER_LIBS + '/database');

exports.actions = function(req, res, ss){
	req.use('node_session.run');
	var temp = res;
	res = function(input){
			res = temp;
			req.session.save();
			res(input);
		};
	req.use('auth_check.run');
	
	return {
		check_lab: function(){
			var username = req.session.username;
			database.find('current_labs',{username: username},{},function(results){
			if (results)
				{
					res(results.name);
				}else{
					res('none');
				}
			});	
		},
		new_lab: function(name){
			database.insert('current_labs',{},function(){
				var time = new Date().getTime();
				var lab_name = name + time;
				
				res(lab_name);
			});
		},
		delete_lab: function(){
			res();
		},
		update_lab: function(name){
			res();
		},
		
	}
	
}
