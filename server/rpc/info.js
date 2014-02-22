var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";

var os = require('os');
var child_process = require('child_process');


// Database functions
var database = require(LABPROJECT_SERVER_LIBS + '/database');
var virtualization = require(LABPROJECT_SERVER_LIBS + '/virtualization');

exports.actions = function(req, res, ss){
	req.use('node_session.run');
	var temp = res;
	res = function(input){
			res = temp;
			req.session.save();
			res(input);
		};
	//req.use('auth_check.run');
	
	return {
		versions: function(){
			
			var about = {}
			child_process.exec('ovs-vsctl --version', function(err, resp) 
				{ 
					var get_ovs_ver_array = resp.split(/\n/);
					var version_line = get_ovs_ver_array[0]
					
					about.vswitch_ver = version_line.replace("ovs-vsctl (Open vSwitch) ","");
					about.libvirt_ver = virtualization.get_libvirt_version();
					about.node_ver = process.versions.node;
					about.labproject = "0.0.1dev";
					
					res(about);
				});
			
		}
	}
}
