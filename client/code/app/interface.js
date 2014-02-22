var overlay_is_enabled = false;
var virtualization = require('./client-virtual-machine');
module.exports = {
	start: function(){
		console.log("Init Interface");
		$('#overlay').hide();
		$('#overlay-message').hide();
		$('#banner-alert').hide();
		$('#dialog').hide();
		
		$('#left').scrollTop($('#left').height()/2);
		$('#left').scrollLeft($('#left').width()/2);
		innerthis = this;
		ss.rpc('auth.check', function(response){
			
			if (response=='success')
				{
					innerthis.login_overlay_disable();
				}else{
					
				}
			var timer = setInterval(function(){
			$('#loading').fadeOut();
			clearInterval(timer);
			},1000);
			
		});
		console.log("Done Init Interface");
	},
	
	button: function(id, onclick){
		$('#' + id).click(onclick);
	},
	
	overlay_enable: function(message){
		if (overlay_is_enabled===false)
			{
				$('#overlay').fadeIn();
				$('#overlay-message').fadeIn();
				$('#overlay-message').html(message);
				overlay_is_enabled = true;
			}
		
	},
	overlay_disable: function(){
		if (overlay_is_enabled===true)
			{
				$('#overlay').fadeOut();
				$('#overlay-message').fadeOut();
				$('#overlay-message').html('');
				overlay_is_enabled = false;
			}
		
	},
	
	login_overlay_enable: function(){
		$('#login').fadeIn();
	},
	
	login_overlay_disable: function(){
		$('#login').fadeOut();
	},
	show_banner_alert: function(message,type){
		//$('#banner-alert').html($(message).text());
		if (type=="ERROR")
			{
				$('#banner-alert').css('color','#7D0000');
				$('#banner-alert').css('background-color','#FF9E9E');
			}else if (type=="SUCCESS"){
				$('#banner-alert').css('color','#185E00');
				$('#banner-alert').css('background-color','#C2FFAD');
			}else{
				$('#banner-alert').css('color','black');
				$('#banner-alert').css('background-color','grey');
			}
		$('#banner-alert').html(message);
		$('#banner-alert').fadeIn();
		var timer = setInterval(function(){
			//alert(1);
			$('#banner-alert').fadeOut();
			$('#banner-alert').html('');
			clearInterval(timer);
			},3000);
	},
	basic_dialog: function(contents){
		
	},
	popup_dialog: function(title, message, button_type, callback)
		{
			var popup_dialog = new dialog(title);
			popup_dialog.set_contents(message);
			popup_dialog.add_button(popup_dialog.default_buttons.cancel);
			popup_dialog.add_button(popup_dialog.default_buttons.default_okay);
			return popup_dialog;
		},
	about_dialog: function(callback)
		{
			ss.rpc('info.versions', function(response){
				console.log("Response: ",response);
				var about_content = ss.tmpl['aboutpage'].render(response );
				
				var the_dialog = new dialog('About');
				the_dialog.set_contents(about_content);
				the_dialog.add_button(the_dialog.default_buttons.default_okay);
				callback(the_dialog);
			});
			
		
		},
	new_lab_dialog: function(callback)
		{
			
			var the_dialog = new dialog('New Lab');
			the_dialog.set_contents('');
			the_dialog.add_button(the_dialog.default_buttons.default_okay);
			callback(the_dialog);
		},
		
	new_device_dialog: function(callback)
		{
			
			var the_dialog = new dialog('New Device');
			
			var device_wizard = new wizard();
			
			
			var init_panel = new wizard_panel('start');
			init_panel.set_content("<div>Hi There <input type='text' id='test'></div>");
			init_panel.set_on_next(function(storage,next){
				storage.test = 'SillyString';
				next();
			});
			device_wizard.add_panel(0,init_panel);
			
			var second_panel = new wizard_panel('second');
			second_panel.set_content("<div>What's Up?<input type='text' id='test2'></div>");
			second_panel.set_on_next(function(storage,next){
				storage.test2 = 'Hamster';
				next();
			});
			device_wizard.add_panel(1,second_panel);
			
			
			
			the_dialog.set_contents(device_wizard.html());
			device_wizard.display();
			the_dialog.dialog_size("90%");
			the_dialog.add_button(the_dialog.default_buttons.default_okay);
			callback(the_dialog);
		},
	manage_virtual_machines_dialog: function(callback)
		{
			var the_dialog = new dialog('New Device');
		},
	newPage: function(config)
		{
			
		},
	Page: Page,
	Pages: function(name){
		
	},
	changePage: function(changeFrom,changeTo){
		
	}
}

function Page(config)
	{
		var self = this;
		self.name = config.name;
		self.template = config.template;
		self.onInit = config.onInit;
		self.location = config.location;
		self.datasource = config.datasource
		self.find = function(){
			
		};
		self.init = function(data){
			
			self.datasource.run(function(data){
				// Render the page
				var rendered_html = '';
				$("[data-location='" + self.location + "']").html(rendered_html);
				self.onInit(self,$("[data-location='" + self.location + "']"));
			});

		};
	}

function DataSource(config)
	{
		var self = this;
		self.run = config.run;
		
	}

var Test = new DataSource({
	run: function(callback){
		ss.rpc('H.f',name.number,function(response){
			callback(response)
		});
	}
});

var available_pages = {}

function wizard()
	{
		var current_panel = {};
		var current_id = 0;
		var current_on_next = '';
		var panels = Array();
		var location = '';
		var wizard_data = {};
		
		this.add_panel = add_panel;
		function add_panel(position,panel)
			{
				if (!isNaN(position)&&position>=0)
					{
						panels[position] = panel;
					}else{
						
					}
				
			}
		
		this.go_next = go_next;
		function go_next()
			{
				if (!is_last_panel)
					{
						current_panel = panels[current_id+1];
						current_panel.display();
					}else{
						// Throw an error!
					}
				
			}

		this.set_on_finish = set_on_finish;
		function set_on_finish(finish_function)
			{
				
			}
		
		this.is_last_panel = is_last_panel;
		function is_last_panel()
			{
				if (current_id==panels.length-1)
					{
						return true;
					}else{
						return false;
					}
			}
		
		this.finish = finish;
		function finish()
			{
				
			}
		
		this.setup_buttons = setup_buttons;
		function setup_buttons()
			{
				$('#wizard_cancel_button').click(function(){
					
				});
				$('#wizard_back_button').click(function(){
					
				});
				if (is_last_panel)
					{
						$('#wizard_next_button').html('Finish');
						$('#wizard_next_button').click(function(){
							current_panel.on_next(wizard_data,finish);
						});
					}else{
						$('#wizard_next_button').html('Next');
						$('#wizard_next_button').click(function(){
							current_panel.on_next(wizard_data,go_next);
						});
					}
				
			}
		
		this.display = display;
		function display()
			{
				current_id = 0;
				current_panel = panels[current_id];
				current_panel.display();
				setup_buttons()
			}
			
		this.html = html;
		function html()
			{
				return '<div id="wizard_panel"></div><div id="wizard_buttons"></div>';
			}
	}
	
function wizard_panel(id)
	{
		var panel_id = id;
		var on_next_function = '';
		var content = '';
		
		this.set_on_next = set_on_next;
		function set_on_next(next_function)
			{
				on_next_function = next_function;
			}
			
		this.set_content = set_content;
		function set_content(input)
			{
				content = input;
			}
			
		this.on_next = on_next;
		function on_next(data,next)
			{
				// If is function
				on_next_function(data,next);
			}
			
		this.display = display;
		function display()
			{
				$('#wizard_panel').html(content);
			}
	}

function dialog(inner_title)
	{
		var title = inner_title;
		var contents;
		var buttons = new Array();
		var inner_this = this;
		
		this.default_buttons = 
			{
				cancel: 
					{
						
						name:'interface_dialog_cancel',
						text: 'Cancel',
						onclick: function(){
							inner_this.close();
						}
						
					},
				no:
					{
						name:'interface_dialog_no',
						text:"No",
						onclick: function(){
							inner_this.close();
						}
					},
				default_okay:
					{
						name:'interface_dialog_default_okay',
						text:"Okay",
						onclick: function(){
							inner_this.close();
						}
					}
			}
		
		this.dialog_size = dialog_size;
		function dialog_size(width_percent,height_margin)
			{
				if (width_percent)
					{
						$('#dialog').width(width_percent);
					}
				
			}
		
		this.set_contents = set_contents
		function set_contents(value)
			{
				contents = value;
			}
		
		this.display = display;
		function display()
			{
				var inner_content = contents;
				var button_content = '';
				
				// Add the buttons
				for (var i=0;i<buttons.length;i++) {
					var button = buttons[i];
					
					
					button_content += "<button id='" + button.name + "'>" + button.text + "</button>";
				}
				
				
				$('#overlay').fadeIn();
				$('#dialog-content').html(inner_content);
				$('#dialog-title').html(title);
				$('#dialog-buttons').html(button_content);
				
				for (var i=0;i<buttons.length;i++) {
					var button = buttons[i];
					$('#' + button.name).click(function(){
						button.onclick();
					});
				}
				$('#dialog').fadeIn();
				
			}
			
		this.add_button = add_button
		function add_button(button_info)
			{
				buttons.push(button_info)
			}
		
		this.close = close;
		function close()
			{
				$('#dialog').fadeOut();
				$('#overlay').fadeOut();
				window.setTimeout(function(){
					$('#dialog-content').html('');
					$('#dialog-title').html('');
					$('#dialog-buttons').html('');
					$('#dialog').width("50%");
				},1000)
				
				
			}
	}
	

