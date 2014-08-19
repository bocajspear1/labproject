var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = LABPROJECT_BASE + "/server/lib";

var config = require(LABPROJECT_BASE + "/config");
var http = require('http');
var fs = require('fs');
var url = require('url');

module.exports = {
	download_file: function(url_string, file_path, download_type, callback){
				
		try
		{
			var url_parse = url.parse(url_string);
		
			var connection = {
				hostname: url_parse.hostname,
				headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; Win64; x64; rv:16.0.1) Gecko/20121011 Firefox/21.0.1'
				},
				path: url_parse.path
			};
			
			// Check if we can write to location
			
			
			var filestream = fs.createWriteStream(file_path, {flags: "wx"});
			filestream.on('error', function (error) {
				callback({"Error": {"error_message": error, "message_type": "DOWNLOAD"}});
			});
			
			var request = http.get(connection, function(response){
				
				var current_length = 0;
				
				if (response.headers['content-type'] != download_type)
					{
						console.log('Not expected type of ' + download_type);
						callback({"Error": {"error_message": "UNEXPECTED_DOWNLOAD_TYPE", "message_type": "DOWNLOAD"}});
					}else{
						response.pipe(filestream);
						
						
						//full_length = response.headers['content-length'];

						//console.log(full_length);

						response.on('data', function (chunk) {
							//console.log('got');
							current_length += chunk.length;
						});
						
						response.on('error', function (error) {
							filestream.end();
							callback({"Error": {"error_message": error, "message_type": "DOWNLOAD"}});
						});
						
						response.on('end', function () {
							console.log(current_length);
							filestream.end();
							callback(current_length, file_path);
						});
						
					}
			});	
				
				
			
		}catch(e){
			callback({"Error": {"error_message": e, "message_type": "CODE"}});
			return;
		}
		
	},
};
