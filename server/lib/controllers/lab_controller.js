var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";

// Logging Functionality
var logging = require(LABPROJECT_SERVER_LIBS + "/util/server_log");

// Permissions management
var permissions = require(LABPROJECT_SERVER_LIBS + "/managers/permissions_manager");

// User and group managment
var user_manager = require(LABPROJECT_SERVER_LIBS + "/managers/user_manager");

// Lab managment
var user_manager = require(LABPROJECT_SERVER_LIBS + "/managers/lab_manager");

module.exports = {

};
