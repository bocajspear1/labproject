// This file automatically gets called first by SocketStream and must always exist

var interface = require('./interface');

// Make 'ss' available to all modules and the browser console
window.ss = require('socketstream');

ss.server.on('disconnect', function(){
	interface.overlay_enable('The connection to the server has been lost, please wait...');
	console.log('Connection down :-(');
});

ss.server.on('reconnect', function(){
	interface.overlay_disable();
	console.log('Connection back up :-)');
});

ss.server.on('ready', function(){

  // Wait for the DOM to finish loading
  jQuery(function(){
    
    // Load app
    require('/app');

  });

});
