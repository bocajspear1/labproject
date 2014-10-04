var execute = require('child_process');

module.exports = {
	verify_running: function(callback){
		
	}
}

function verify_libvirt_running()
	{
		execute.exec("ps -ewwo args | grep libvirtd", function(err, resp)
			{
				var lines = resp.split(/\n/);
				var isrunning = false;
				
				for(var i = 0;i < lines.length;i++)
				{
					var nametest=/^libvirtd/g;
					var teststring = lines[i].trim();
					
					if (nametest.test(teststring))
						{
							isrunning = true;
						}
				}
				if (isrunning === true)
					{
						console.log(color.greenBright('Libvirt is running\n\n'));
						check_hypervisors();
					}else{
						console.log(color.redBright('\nLibvirt is not running \n\n'));
						throw new Error(STARTUP_ERROR);
					}
			});
	}
