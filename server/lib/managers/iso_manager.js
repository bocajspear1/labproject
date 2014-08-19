var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = LABPROJECT_BASE + "/server/lib";

var database = require(LABPROJECT_SERVER_LIBS + '/util/database');
var crypto = require(LABPROJECT_SERVER_LIBS + '/util/crypto');
var download = require(LABPROJECT_SERVER_LIBS + '/util/download');
var config = require(LABPROJECT_BASE + "/config");
var http = require('http');
var fs = require('fs');
var url = require('url');


var iso_util = {
	update_new_iso: function(name, storage_path, url_string, hash_method, hash, callback){
		database.update('isos', {name: name}, {$set: {path: storage_path, url: url_string, hash_method: hash_method, hash: hash}}, false, function(result){
			callback(result);
		});
	},
	delete_iso_file: function(name, callback){
		fs.unlink(config.iso_path + "/" + name + ".iso", function (e) {
			if (e) 
				{
					callback({"Error": {"error_message" : e, "message_type": "FS"}});
				}else{
					callback(true);
				}
		});
	}
};

function iso(name)
	{
		var self = this;
		var Private = {
			name: '',
			os_type: '',
			arch: '',
			version: '',
			url: '',
			path: '',
			hash_method: 'none',
			hash: '',
			is_live_cd: false
		};
		
		if (name)
			{
				Private.name = name;
			}else{
				self = {"Error":{"error_message": "ISO_NAME_NOT_SET", "message_type": "CODE"}};
			}
			
		self.load = function(){
			database.findOne('isos', {'name': Private.name}, function(result){
				
			});
		};
		
		self.save = function(){
			
		};
		
		self.remove = function(){
			
		};
		
		
		self.is_live_cd = function(input){
			if (input === true || input === false)
				{
					Private.is_live_cd = input;
				}else{
					return {"Error":{"error_message": "INVALID_ILCD_SETTING", "message_type": "CODE"}};
				}
		};
		
		self.set_arch = function(){
			
		};
		
		self.set_version = function(){
			
		};
		
		self.set_os_type = function(){
			
		};
	}

//

module.exports = {
	get_stored_isos: function(callback){
		database.find('isos',{},{},function(results){
			callback(results);
		});
	},
	new_iso: function(name, url_string, hash_method, hash, callback){
		if (!name||name.trim()===""||!url_string||url_string.trim()==="")
			{
				callback({"Error":{"error_message": "DATA_NOT_SET", "message_type": "CODE"}});
			}else{
				database.insert('isos', new_lab_object,function(result){
					if (result.Error)
						{ 
							if (result.Error.error_message.name == "MongoError" && result.Error.error_message.code == 11000)
								{
									callback({"Error":{"error_message": "ISO_NAME_EXISTS", "message_type": "CONFIG"}});
									return;
								}else{
									logging.log(logging.TYPES.CODE_ERROR, result.Error);
									callback(result);
									return;
								}
						}else{
							
							var download_to_location = config.iso_path + "/" + name + ".iso";
							
							download.download_file(url_string, download_to_location, 'application/octet-stream', function(result){
								if (result.Error)
									{
										callback(result);
										return;
									}else{
										
										// Verify file is given hash
										if (hash_method == "md5")
											{
												crypto.md5_file(download_to_location ,function(result_hash){
													if (verify.hash == result_hash)
														{
															iso_util.update_new_iso(name, download_to_location, url_string, hash_method, hash, function(){
																module.exports.get_iso(name, callback);
															});
														}else{
															iso_util.delete_iso_file(name, function(result){
																if (result.Error)
																	{
																		callback(result);
																	}else{
																		callback({"Error": {"error_message" : "HASH_NOT_MATCH", "message_type": "FS"}})
																	}
															});
														}
												});
											}else if (hash_method == "sha1"){
												crypto.sha1_file(download_to_location ,function(result_hash){
													if (verify.hash == result_hash)
														{
															iso_util.update_new_iso(name, download_to_location, url_string, hash_method, hash, function(){
																module.exports.get_iso(name, callback);
															});
														}else{
															iso_util.delete_iso_file(name, function(result){
																if (result.Error)
																	{
																		callback(result);
																	}else{
																		callback({"Error": {"error_message" : "HASH_NOT_MATCH", "message_type": "FS"}})
																	}
															});
														}
												});
											}else{
												// Check only if the file exists
												iso_util.update_new_iso(name, download_to_location, url_string, hash_method, hash, function(){
													module.exports.get_iso(name, callback);
												});
											}
									}
							});
						}
				});	
			}
	},
	get_iso: function(name, callback){
		var iso_object = new iso(name);
		iso_object.load(callback);
	},
	
	delete_iso: function(name,callback){
		database.findOne('isos',{name: name},function(result){
			if (!result)
				{
					callback({error: 'No such ISO exists'});
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
};

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
