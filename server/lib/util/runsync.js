var function_list = [];

module.exports = {
	run: function(end){
		if (function_list.length>0)
			{
				var torun = function_list.shift();
				torun(function(){
					module.exports.run(end);
				}); 
			}else{
				end();
			}
		
	},
	next: function(newfunction)
		{
			function_list.push(newfunction);
		}
};
