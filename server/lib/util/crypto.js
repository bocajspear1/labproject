var crypto = require('crypto');
var fs = require('fs');

var RUNTIMES = 10000;
var KEYSIZE = 128;

module.exports = {
	pbkdf2: function(data, salt)
		{
			if (data && salt)
				{
					try
					{
						var key = crypto.pbkdf2Sync(data, salt, RUNTIMES, KEYSIZE);
					
						return key.toString('hex');
						
					}catch(e){
						return {"Error": {"error_message": e, "message_type": "CRYPTO"}};
					}
				}else{
					return {"Error": {"error_message": "data or salt not defined", "message_type": "CRYPTO"}};
				}

		},
	random_hash : function()
		{
			var hash = crypto.randomBytes(128/8).toString('hex');
			return hash;
		},
	md5_file: function(filename,callback){
		var shasum = crypto.createHash('md5');
		get_file_hash(filename,shasum,callback);
	},
	sha1_file: function(value){
		var shasum = crypto.createHash('sha1');
		get_file_hash(filename,shasum,callback);
	}

};

function get_file_hash(filename,shasum,callback)
	{
		// Derived from example at http://nodejs.org/api/crypto.html
		var filestream = fs.ReadStream(filename);
		filestream.on('data', function(d) {
		  shasum.update(d);
		});

		filestream.on('end', function() {
		  var hash = shasum.digest('hex');
		  
		  callback(hash);
		});
	}

