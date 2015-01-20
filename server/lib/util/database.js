var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = LABPROJECT_BASE + "/server/lib";

var mongodb = require('mongodb');
var mongoclient = mongodb.MongoClient;
var mongostring = require(LABPROJECT_BASE + '/config').database_connection_string;

var sanitize = require(LABPROJECT_SERVER_LIBS + '/util/sanitize');

var callback_error = require(LABPROJECT_SERVER_LIBS + '/util/error').callback_error;
var error_type = require(LABPROJECT_SERVER_LIBS + '/util/error').error_type;

// Holds the database connection
var db_connection;

function connect_db(callback)
	{
		mongoclient.connect(mongostring, function(err, db) {
			if (!err)
				{
					db_connection = db;
					if (typeof callback == "function")
						{
							callback();
						}
					
				}else{
					throw new Error("Error in connecting to database: " + err);
				}
			
		});
	}

function get_connection(callback)
	{
		if (!db_connection)
			{
				connect_db(function(){
					callback(db_connection);
				});
			}else{
				callback(db_connection);
			}
	}



connect_db();

module.exports = {
	/*
	 * Function: find
	 * 
	 * Created by: Jacob Hartman
	 * 
	 * Description: Wraps MongoDB find function into a more easy to use, simplified function
	 * 
	 * Input:
	 *    	collection_name[string]: The name of the collection the data will be search for in
	 * 		query[object]: An object containing the search terms
	 * 		options[object]: An object containing options for the query
	 * 			options.fields[object]: Contains the fields to limit the results by
	 * 		callback: Callback function
	 *     
	 * Callback Function:
	 *     Input:
	 * 			message[string]: The result ot return
	 * 				message.ERROR[object]: An error report 
	 *     
	 * Preconditions:
	 *    - MongoDB is properly running and the MongoDB NodeJS client is properly installed
	 *     
	 * Postconditions:
	 *    - None
	 * 
	 * Usage: 
	 * 	database.find(COLLECTION_NAME, {"Query": "Query"}, {OPTIONS}, function(result){})
	 */
	find: function(collection_name,query,options,callback){
		
		if (typeof callback !== "function")
			{
				throw new Error('No callback defined');
			}
		
		get_connection(function(db){
			var fields = {};
			if (options&&options.fields)
				{
					fields = options.fields;
					options.fields = null;
				}
			var cursor = db.collection(collection_name).find(query, fields, options);
			
			if (cursor)
				{
					cursor.toArray(function(err, query_results){
					if (err)
						{
							callback(new callback_error(error_type.DATABASE_ERROR, "Error from MongoDB", err));
						}else{
							callback(query_results);
						}
							
						
					});
				}else{
					throw new Error('Invalid collection name ' + collection_name);
				}
		});
	},
	findOne: function(collection_name,query,callback){
		if (typeof callback !== "function")
			{
				throw new Error('No callback defined');
			}
		
		get_connection(function(db){
			var col = db.collection(collection_name);
			if (col)
				{
					col.findOne(query, function(err, query_results) {
						if (err)
							{
								callback(new callback_error(error_type.DATABASE_ERROR, "Error from MongoDB", err));
							}else{
								callback(query_results);
							}
					});
				}else{
					throw new Error('Invalid collection name ' + collection_name);
				}
			
		});
	},
	insert: function(collection_name, query,callback){
		
		if (typeof callback !== "function")
			{
				throw new Error('No callback defined');
			}
		
		get_connection(function(db){
			var col = db.collection(collection_name);
			if (col)
				{
					col.insert(query, {safe:true}, function(err, query_results) {
						if (err)
							{
								callback(new callback_error(error_type.DATABASE_ERROR, "Error from MongoDB", err));
							}else{
								callback(query_results);
							}
					});
				}else{
					throw new Error('Invalid collection name ' + collection_name);
				}
			
		});
	},
	update: function(collection_name, query, update, do_all ,callback){
		
		if (typeof callback !== "function")
			{
				throw new Error('No callback defined');
			}
		
		get_connection(function(db){
			var col = db.collection(collection_name);
			if (col)
				{
					var options = {safe:true};
					if (do_all === true)
						{
							options.multi = true;
						}
					col.update(query, update, options, function(err, query_results) {
						if (err)
							{
								callback(new callback_error(error_type.DATABASE_ERROR, "Error from MongoDB", err));					
							}else{
								callback(query_results);
							}

					});
				}else{
					throw new Error('Invalid collection name ' + collection_name);
				}
			
		});
	},
	remove: function(collection_name,query,callback){
		
		
		
		if (typeof callback !== "function")
			{
				throw new Error('No callback defined');
			}
		
		get_connection(function(db){
			var col = db.collection(collection_name);
			if (col)
				{
					col.remove(query, {safe:true}, function(err, query_results) {
						if (err)
							{
								callback(new callback_error(error_type.DATABASE_ERROR, "Error from MongoDB", err));
							}else{
								callback(query_results);
							}
					});
				}else{
					throw new Error('Invalid collection name ' + collection_name);
				}
			
		});
	}
};
