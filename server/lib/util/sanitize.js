module.exports = {
	// Only allows letters, numbers
	alphanum_string: function(input){
		return input.replace(/[^a-zA-Z0-9]/g,"");
	},
	// Only allows letters, numbers and - and _, for names
	simple_string: function(input){
		return input.replace(/[^a-zA-Z0-9\-_]/g,"");
	},
	// For descriptions and sentences, no html
	simple_text: function(input){
		input = input.replace(/<[^>]*>/g,"");
		return input.replace(/[^- a-zA-Z0-9'"\(\)%&.?!@$#=:\_\s]/g,"");
	},
	path: function(input){
		return input.replace(/[^-a-zA-Z0-9\/._]/g,"");
	},
	parameter: function(input){
		return input.replace(/[^-a-zA-Z0-9_]/g,"");
	},
	safe_command: function(input){
		return input.replace(/[^-a-zA-Z0-9_]/g,"");
	},
	
	
};
