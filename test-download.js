var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";

var download = require(LABPROJECT_SERVER_LIBS + '/util/download');

download.download_file("http://distro.ibiblio.org/tinycorelinux/5.x/x86/release/Core-current.iso", "/home/jacob/test.iso", 'application/octet-stream', function(result){
	console.log("RESULT: ", result);
});
