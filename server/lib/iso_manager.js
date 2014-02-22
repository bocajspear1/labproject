var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = LABPROJECT_BASE + "/server/lib";

var database = require(LABPROJECT_SERVER_LIBS + '/database');
var cryptojs = require(LABPROJECT_SERVER_LIBS + '/cryptojs');
var config = require(LABPROJECT_BASE + "/config");
var http = require('http');
var fs = require('fs');
var url = require('url');

module.exports = {
	get_stored_isos: function(callback){
		database.find('isos',{},{},function(results){
			callback(results);
		});
	},
	get_iso_info: function(iso_id, callback){
		
	},
	new_iso: function(url_string, info, verify, callback){
		if (!info.name||!info.version||!info.type)
			{
				throw new Error('ISO needs name, version and type');
			}else{
				
			}
		database.findOne('isos',{name: info.name},function(result){
			if (result)
				{
					callback({error: "An ISO of that name already exists"});
				}else{
					console.log('new iso from ' + url_string);
		
					download_iso(url_string,info.name,function(result){
						info.path = result;
						info.url = url_string;
						
						if (result!==false)
							{
								if (verify !== false)
									{
									  if (verify.method == 'sha1')
										{
											cryptojs.sha1_file(result,function(result_hash){
												if (verify.hash == result_hash)
													{
														add_iso_to_database(info,callback)
													}else{
														console.log('bad');
													}
											});
											
										}else if (verify.method == 'md5'){
											cryptojs.md5_file(result,function(result_hash){
												if (verify.hash == result_hash)
													{
														add_iso_to_database(info,callback)
													}else{
														console.log('bad');
													}
											});
											
										}else{
											callback({error: 'Unsupported hash type'})	
											
										}
										
										
									}else{
										add_iso_to_database(info,callback)
									}
								
							}else{
								callback({error: 'Download Failed'})
							}
				});
			}
			
		});
	},
	delete_iso: function(name,callback){
		database.findOne('isos',{name: name},function(result){
			if (!result)
				{
					callback({error: 'No such ISO exists'})
				}else{
					database.remove('isos',{name:name},function(result){
						fs.unlink(result.path, function (err) {
						  if (err) throw err;
						  console.log('successfully deleted /tmp/hello');
						});
					});
				}
		});
	}
}

function add_iso_to_database(info,callback)
	{
		if (!info.name||!info.version||!info.type||!info.path||!info.url)
			{
				throw new Error('ISO needs name, version and type');
			}
		database.insert('isos',{name: info.name, type: info.type, url: info.url, version: info.version, path: info.path}, function(){
				callback();			
		});
	}

function download_iso(url_string,name,callback)
	{
		var download_to = config.iso_path;
		var url_parse = url.parse(url_string);
		
		
		var connection = {
			hostname: url_parse.hostname,
			headers: {
			'User-Agent': 'Mozilla/5.0 (Windows NT 6.2; Win64; x64; rv:16.0.1) Gecko/20121011 Firefox/21.0.1'
			},
			path: url_parse.path
		};
		
		var new_iso_file = download_to + "/" + name + '.iso';
		
		var filestream = fs.createWriteStream(new_iso_file);
		
		var request = http.get(connection, function(response){

			if (response.headers['content-type'] != 'application/octet-stream')
				{
					console.log('not an iso');
					callback(false);
				}else{
					response.pipe(filestream);
					
					
					//full_length = response.headers['content-length'];

					//console.log(full_length);

					response.on('data', function (chunk) {
						//console.log('got');
						//current_length += chunk.length;
					});
					
					response.on('end', function () {
						filestream.end();
						callback(new_iso_file);
					});
					
				}
			
				
		});
		
		
	}
