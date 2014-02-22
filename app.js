// My SocketStream 0.3 app

console.log("Starting!");

var http = require('http'),
    ss = require('socketstream');


console.log("Defining Page");
// Define a single-page client called 'main'
ss.client.define('main', {
  view: 'app.html',
  css:  ['libs/reset.css', 'main.css', 'codemirror.css'],
  code: ['libs/jquery.min.js', 'app', 'libs/codemirror.js'],
  tmpl: '*'
});

console.log("Setting Route!");
// Serve this client on the root URL
ss.http.route('/', function(req, res){
  res.serveClient('main');
});

// Code Formatters
ss.client.formatters.add(require('ss-stylus'));

// Use server-side compiled Hogan (Mustache) templates. Others engines available
ss.client.templateEngine.use(require('ss-hogan'));

// Minimize and pack assets if you type: SS_ENV=production node app.js
if (ss.env === 'production') ss.client.packAssets();



console.log("Starting server");
// Start web server
var server = http.Server(ss.http.middleware);
server.listen(3000);

console.log("Starting Socketstream");
// Start SocketStream
ss.start(server);


ss.session.store.use('redis');
