var logger = require('./server/lib/server_log');

var virt = require('./server/lib/virtualization');
var runsync = require('./server/lib/runsync');

console.log(virt.get_available_hypervisors());
