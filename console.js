var clicolor = require("cli-color");
var colors = {
	error: clicolor.redBright,
	warning: clicolor.xterm(202),
	debug: clicolor.cyanBright,
	notice: clicolor.blueBright
};

var prompt = require('prompt');

prompt.message = "lp-console".green;
prompt.delimiter = "> ";


var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = LABPROJECT_BASE + "/server/lib";

var database = require(LABPROJECT_SERVER_LIBS + '/util/database');
var crypto = require(LABPROJECT_SERVER_LIBS + '/util/crypto');

var permissions = require(LABPROJECT_SERVER_LIBS + '/managers/permissions_manager');

var login_schema = {
    properties: {
		username:
			{
				pattern: /^[a-zA-Z0-9\-]+$/,
				message: "Invalid username"
			},
		password:
			{
				hidden: true
			}
    }
};

console.log(colors.notice("\nWelcome to the LabProject Console!\n"));
console.log(colors.debug("\nLogin:"));

prompt.start();

login_prompt()

function login_prompt()
	{
		prompt.get(login_schema, function (err, input) {

			if (err)
				{
					console.log("\n", err);
					console.log(colors.notice("\nExiting...\n"));
					process.exit();
				}else{
					database.findOne('users',{username: input.username}, function(result){
						if (!result)
							{
								console.log(colors.error("\nInvalid username or password\n"));
								process.exit();
							}else{
								var salt = result.salt;
								
								
								
								var hash = crypto.pbkdf2(input.password, salt);
								
								if (hash == result.hash)
									{
										console.log(colors.notice("\nLogin Complete\n"));
										menu_prompt('ROOT');
									}else{
										// Login Bad
										console.log(colors.error("\nInvalid username or password\n"));
										process.exit();
									}
								
							}
					});
				}
		});
	}

var menu_options = {
	device: {
		add: {
			description: "Add a device",
			run: function(callback){
				console.log("\nAdding Device");
				var add_schema = {
					properties: {
						device_name: { description: 'Device Name' },
						os_type: { description: ' Select OS Type\n\n1) Linux\n2) Windows\n3) Other\n\n', pattern: /[1-3]/, message: "Enter the number of the OS type" }
					}
				};
				
				single_prompt(add_schema, function(result){
					console.log(result);
					callback("good");
				});
				
				
			}},
		remove: {description: "Add a device" ,run: function(callback){console.log("Remove");}}
	},
	user: {
		add: {
			description: "Add a new user",
			run: function(callback){
				
			}},
	},
	settings: {
		
	}
}

function menu_prompt(current)
	{
		prompt.start();
		
		var prompt_string = '';
		
		if (current == 'ROOT')
			{
				prompt_string = 'menu';
			}else{
				prompt_string = current;
			}
		
		var menu_schema = {
			properties: {
			  menu_item:
				{
					description: prompt_string
				}
			}
		};
		
		prompt.get(menu_schema, function (err, input) {
			if (err)
				{
					console.log("\n", err);
					console.log(colors.notice("\nExiting...\n"));
					process.exit();
				}else{
					if (current == 'ROOT')
						{
							if (menu_options[input.menu_item])
								{
									menu_prompt(input.menu_item);
								}else{
									console.log(colors.error("\nInvalid input\n"));
									menu_prompt(current)
								}
						}else{
							if (menu_options[current][input.menu_item])
								{
									menu_options[current][input.menu_item].run(function(status){
										console.log("Complete");
									
										menu_prompt(current);
									});
								}else{
									console.log(colors.error("\nInvalid input\n"));
									menu_prompt(current);
								}
						}
				}
		});		
	}

function single_prompt(schema, callback)
	{
		prompt.get(schema, function (err, input) {
			if (err)
				{
					console.log("\n", err);
					console.log(colors.notice("\nExiting...\n"));
				}else{
					callback(input);
				}
		});
	}

