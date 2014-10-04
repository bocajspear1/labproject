module.exports = {
	// Only allows letters, numbers and - and _, for names
	simple_string: function(input){
		return input.replace(/[^a-zA-Z0-9\-_]/g,"");
	},
	// For descriptions and sentences, no html
	simple_text: function(input){
		return input.replace(/[^ a-zA-Z0-9'"\n\(\)%&.?!#=:\-_]/g,"");
	},
	only_boolean: function(input){
		if (input === true || input === false)
			{
				return input;
			}else{
				return false;
			}
	},
	
};
