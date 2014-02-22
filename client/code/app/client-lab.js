
module.exports = {
	new_lab: function(name, callback){
		
	},
	check_lab: function(callback){
		ss.rpc('lab.check_lab', name, function(response){
			if (response=='none')
				{
					callback(false);
				}else{
					callback(response);
				}
		});
	},
	delete_lab: function(callback){
		ss.rpc('lab.delete_lab', function(response){
			callback(response);	
		});
	},
	modify_lab: function(){
		alert(1);
	},
	load_lab: function(){
		ss.rpc('lab.update_lab', name, function(response){
			
		});
	}
}
