var clicolor = require("cli-color");
var colors = {
	error: clicolor.redBright,
	warning: clicolor.xterm(202),
	debug: clicolor.cyanBright,
	notice: clicolor.blueBright
};


module.exports = {
	log: function(type, message){
		
		if (type==1)
			{
				if (typeof message == "string")
					{
						console.log(colors.debug("> DEBUG: " + message + "\n"));
					}else{
						console.log(colors.debug("> DEBUG\n\n"), message, colors.debug("\n\n> END DEBUG"));
					}
			}else if(type==2){
				if (typeof message == "string")
					{
						console.log(colors.error("! VIRTUALIZATION ERROR: " + message + "\n"));
					}else{
						console.log(colors.error("! VIRTUALIZATION ERROR\n\n"), message, colors.error("\n\n! END VIRTUALIZATION ERROR"));
					}
			}else if(type==3){
				if (typeof message == "string")
					{
						console.log(colors.error("! CODE ERROR: " + message + "\n"));
					}else{
						console.log(colors.error("! CODE ERROR\n\n"), message, colors.error("\n\n! END CODE ERROR"));
					}
			}else if(type==4){
				if (typeof message == "string")
					{
						console.log(colors.notice("! NOTICE: " + message + "\n"));
					}else{
						console.log(colors.notice("! NOTICE\n\n"), message, colors.notice("\n\n! END NOTICE"));
					}

			}else if(type==5){
				if (typeof message == "string")
					{
						console.log(colors.warning("! WARNING: " + message + "\n"));
					}else{
						console.log(colors.warning("! WARNING\n\n"), message, colors.warning("\n\n! END WARNING"));
					}
			}else if(type==6){
				if (typeof message == "string")
					{
						console.log(colors.error("! SERVER ERROR: " + message + "\n"));
					}else{
						console.log(colors.error("! SERVER ERROR\n\n"), message, colors.error("\n\n! END SERVER ERROR"));
					}
			}else{
				console.log(colors.warning("INVALID TYPE NUMBER"));
			}
		
	},
	TYPES: {
		DEBUG: 1,
		VM_ERROR: 2,
		CODE_ERROR: 3,
		NOTICE: 4,
		WARNING: 5,
		SERVER_ERROR: 6
	}
};
