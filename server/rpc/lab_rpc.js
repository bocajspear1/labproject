var LABPROJECT_BASE = process.cwd();
var LABPROJECT_SERVER_LIBS = process.cwd() + "/server/lib";

// Database functions
var database = require(LABPROJECT_SERVER_LIBS + '/util/database');

var lab_manager = require(LABPROJECT_SERVER_LIBS + '/managers/lab_manager');

var user_manager = require(LABPROJECT_SERVER_LIBS + '/managers/user_manager');

exports.actions = function(req, res, ss){
	// Run session production
	req.use('node_session.run');
	
	// Make sure session is saved on response
	var temp = res;
	res = function(input){
			res = temp;
			req.session.save();
			res(input);
	};
	
	// Verify the user has authenticated
	req.use('auth_check.run');
	
	
	/*
	 * Session Variables Expected
	 * 
	 * username
	 * current_lab
	 * 
	 */
	
	// Begin RPC functions
	return {
		/*
		 * Get a list of accessible labs for the current user
		 */
		get_lab_list: function(){
			
		},
		/*
		 * Create new lab
		 */
		new_lab: function(){
			
		},
		/*
		 * Get a lab's information and configuration
		 */
		get_lab: function(){
			
		},
		/*
		 * Set user's current lab
		 */ 
		assign_lab: function(){
			
		},
		/*
		 * Start the user's current lab
		 */
		start_current_lab: function(){
			
		},
		
		stop_current_lab: function(){
			
		},
		
		create_save_point: function(){
			
		},
		
		/*
		 * Attempt to add device to lab. Should be followed by a call to 'update_topology'.
		 */
		add_device: function(){
			
		},
		
		remove_device: function(){
			
		},
		
		update_topology: function(){
			
		}
	};
	// End RPC functions
};
