
// LOOK INTO KVM

var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";

var os = require('os');
var exec = require('child_process').exec;

var ARCH = os.arch();

// Logging Functionality
var logging = require(LABPROJECT_SERVER_LIBS + "/server_log");

// Database functions
var database = require(LABPROJECT_SERVER_LIBS + '/database');

var libvirt = require('libvirt');


var config = require(LABPROJECT_BASE +'/config');
if (config.libvirt_path != '')
	{
		process.env.LIBVIRTD_PATH = config.libvirt_path;
		console.log(process.env.LIBVIRTD_PATH);
	}

var uuid = require('node-uuid');
var xml_builder = require('xmlbuilder');
var xml_parser = require('xmldoc');
var iso_manager = require(LABPROJECT_SERVER_LIBS + '/iso_manager');

var pool_xml = '<pool type="dir"><name>labproject</name><target><path>' + config.pool_path + '</path></target></pool>'

var default_hypervisor = '';






var hypervisor = new libvirt.Hypervisor("vbox:///system");

var callback = function(result){
	console.log(result);
}

var pool_path = '/home/jacob/labproject-pool/'
logging.log(logging.TYPES.DEBUG, "Before Call");
exec('df -h ' + pool_path, function(err, resp, stderr){ 
	
if (err||stderr)
	{
		logging.log(logging.TYPES.CODE_ERROR,err);
		callback({"Error":err});
	}else{
			
		logging.log(logging.TYPES.DEBUG,"Good");
		
		var resp_array = resp.split(/\n/);
		var line_array = resp_array[1].split(' ');
		var available = line_array[3];
		logging.log(logging.TYPES.DEBUG,available);
		callback(available);
		
	}
}); 

