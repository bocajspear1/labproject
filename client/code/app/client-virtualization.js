module.exports = {
	getHypervisors: function(callback){
		ss.rpc("virtual_machine.getHypervisors", function(result){
			callback(result);
		});
	},
	listVM: function(data){
		ss.rpc("virtual_machine.listVM", data, function(result){
			
		});
	}
	createVM: function(data){
		ss.rpc("virtual_machine.createVM", data, function(result){
			
		});
	}
}
