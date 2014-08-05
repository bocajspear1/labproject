var interface = require('./interface');
var authentication = require('./client-auth');
var user = require('./client-user')
//var virtualization = require('./client-virtualization');


interface.init();

authentication.set_log_off(function(){
	interface.switchPage("Login","div#mainpage");
})

function Login_Page(){
	var self = this;
	self.user = ko.observable();
	self.password = ko.observable();
	
	self.login = function(){
		$('#login-message').hide()
		authentication.authenticate(self.user(),self.password(),function(result){
			if (result == 'success')
				{
					interface.switchPage("Welcome","div#mainpage");
				}else{
					if (result == 'fail')
						{
							$('#login-message').text("Incorrect username or password.")
						}else if (result == 'multiple'){
							$('#login-message').text("You are already logged in elsewhere.")
						}
					
					$('#login-message').fadeIn();
					setTimeout(function(){
						$('#login-message').fadeOut();
					},3000)
				}
			
		});
	}
	
	self.init = function(){
		$('#login-message').hide()
	}
	
	self.init()
}

interface.newPage({
	name: 'Login',
	ViewModel: Login_Page,
	onInit: function(self,parent){
		
	},
	template: 'login'
});



interface.newPage({
	name: 'New_Lab_Dialog_Page',
	ViewModel: function(){
		var self = this;
		self.lab_name = ko.observable();
	},
	onInit: function(self,parent){
		console.log("Open Dialog");
	},
	template: 'new_lab_dialog'
});

interface.newDialog({
	name: "New_Lab_Dialog",
	title: "New Lab",
	page: "New_Lab_Dialog_Page",
	onClose: function(){
		alert("Closing");
	}
});




function Welcome_Page(){
	var self = this;
	self.user = ko.observable();
	self.full_name = ko.observable();
	self.init = function(){
		//user.get_user_info(
	};
	self.new_lab = function(){
		interface.displayDialog("New_Lab_Dialog");
	};
	self.open_lab = function(){
		
	};
	self.settings = function(){
		
	};
	self.logout = function(){
		authentication.logout(function(result){
			interface.switchPage("Login","div#mainpage");
		})
	}
}

interface.newPage({
	name: 'Welcome',
	ViewModel: Welcome_Page,
	onInit: function(self,parent){
		
	},
	template: 'welcome'
});

interface.newPage({
	name: 'Login',
	ViewModel: Login_Page,
	onInit: function(self,parent){
		
	},
	template: 'login'
});



authentication.check(function(result){
	if (result===false)
		{
			interface.bindPage("Login","div#mainpage");
			
		}else if (result !== true){
			
		}else{
			interface.bindPage("Welcome","div#mainpage");
		}
});

