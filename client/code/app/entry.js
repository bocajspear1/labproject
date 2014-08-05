// This file automatically gets called first by SocketStream and must always exist

var interface = require('./interface');

// Make 'ss' available to all modules and the browser console
window.ss = require('socketstream');

ss.server.on('disconnect', function(){
	interface.enableDisconnectOverlay();
	console.log('Connection down');
});

ss.server.on('reconnect', function(){
	interface.disableDisconnectOverlay();
	console.log('Connection back up');
});

ss.event.on('switch_session', function(){
	console.log("Session Switching")
	window.location = "/switch";
});

ss.server.on('ready', function(){

  // Wait for the DOM to finish loading
  jQuery(function(){
    
    // Load app
    require('/app');

  });

});
