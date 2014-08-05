// Stores all pages
var PageList = {};
var DialogList = {};
var location_list = {};

var NOTICE_TYPES = {
	NOTICE: 0,
	ERROR: 1,
	COMPLETE: 2
}



function Page(config){
	var private_view_model;
	var private_location;
	
	var self = this;
	self.template = config.template;
	self.viewModel = config.ViewModel;
	self.onInit = config.onInit;
	
	self.bind = function(location){
		console.log("Binding " + location)
		
		var dom_location = $(location);
		var page_html = ss.tmpl[self.template].render({});
		
		dom_location.html(page_html);
		
		dom_location.delay(100).fadeIn()
		
		private_location = location;
		
		private_view_model= new self.viewModel();
		
		if (private_view_model.init)
			{
				private_view_model.init();
			}
		
		ko.applyBindings(private_view_model,dom_location[0]);
		
		self.onInit(self,dom_location);
	};
	self.unbind = function(){
		console.log("Unbinding " + private_location)
		
		var dom_location = $(private_location);
		
		dom_location.delay(100).fadeOut()
		ko.cleanNode(dom_location[0]);
		
		private_view_model = null
		
		
		
	}
}

function Dialog(config){
	var self = this;
	self.title = config.title;
	self.name = config.name;
	self.page = config.page;
	self.onClose = config.onClose;
	self.settings = config.settings;
	self.init = function(){
		// Create the wrapper
		var wrapper_id = config.name + "-dialog-wrapper";
		
		$('body').append("<div id='" +  wrapper_id + "'></div>");
		
		PageList[self.page].bind("#" + wrapper_id);
		
		$("#" + wrapper_id).bind('dialogclose', function(event) {
			ko.cleanNode($("#" + wrapper_id)[0]);
			$("#" + wrapper_id).remove();
			self.onClose()
		});
		
	},
	self.show = function(){
		self.init();
		
		var wrapper_id = self.name + "-dialog-wrapper";
		
		console.log("Opening " + wrapper_id)
		
		var dialog_settings = {
			show: {
				effect: "fade",
				duration: 500
			},
			hide: {
				effect: "fade",
				duration: 500
			}
		}
		
		if (self.title)
			{
				dialog_settings.title = self.title
			}
		
		if (self.settings && self.settings.modal)
			{
				
			}
		
		$( "#" + wrapper_id).dialog(dialog_settings);
	}
	
}

module.exports = {
	init: function(){
		if (typeof ko == "undefined")
			{
				console.log("Knockout not found");
				$("body").html("<div>Knockout not found!</div>");
			}else{
				$("#banner-notify").hide();
				
				$("#loading-overlay").fadeOut();
			}
	},
	newPage: function(config){
		var new_page = new Page(config);
		PageList[config.name] = new_page;		
	},
	removePage: function(config){
		
	},
	switchPage: function(switchTo, location){
		if (location_list[location])
			{
				
				name = location_list[location];
				
				PageList[name].unbind();
				setTimeout(function(){
					if (PageList[switchTo])
							{
								
								PageList[switchTo].bind(location);
								location_list[location] = switchTo;
								
							}else{
								console.log("Page does not exist");
							}
				},1000)
				
				
			}else{
				console.log("Location has not been set");
			}
		
	},
	bindPage: function(name,location){
		if (PageList[name])
			{
				console.log("Page found");
				PageList[name].bind(location);
				location_list[location] = name;
				
			}else{
				console.log("Page does not exist");
			}
	},
	newDialog: function(config){
		if (DialogList[config.name])
			{
				
			}else{
				var new_dialog = new Dialog(config);
				PageList[config.name] = new_dialog;
			}
		
	},
	displayDialog: function(name){
			PageList[name].show();
	},
	showBannerNotification: function(text, type){
		$("#banner-notify").html(text);
		if (type==NOTICE_TYPES.NOTICE)
			{
				$('#banner-notify').css('color','#0D0080');
				$('#banner-notify').css('background-color','#B5C9FF');
			}else if (type==NOTICE_TYPES.ERROR){
				$('#banner-notify').css('color','#AD0000');
				$('#banner-notify').css('background-color','#FFB3B3');
			}else if (type==NOTICE_TYPES.COMPLETE){
				$('#banner-notify').css('color','#0B8000');
				$('#banner-notify').css('background-color','#ABFFA3');
			}else{
				$('#banner-notify').css('color','black');
				$('#banner-notify').css('background-color','grey');
			}
		$("#banner-notify").fadeIn();
		
		window.setTimeout(end_banner,3000)
		
		function end_banner(){
			$("#banner-notify").fadeOut();
			function remove_text(){
				$("#banner-notify").html("");
			}
			window.setTimeout(remove_text,1000)
		}
		
		
	},
	NOTICE_TYPES: NOTICE_TYPES,
	enableDisconnectOverlay: function(){
		if ($('#disconnect-overlay').length>0)
			{
				
			}else{
				$('body').append("<div id='disconnect-overlay'>The connection to the server has been lost...</div>");
			}
		
	},
	disableDisconnectOverlay: function(){
		$('#disconnect-overlay').fadeOut();
		window.setTimeout(remove_tag,1000)
		function remove_tag()
			{
				$('#disconnect-overlay').remove();
			}
		
	},
	
}
