var gulp = require("gulp");
var jshint = require("gulp-jshint");
var exec = require('child_process').exec;

var clicolor = require("cli-color");
var colors = {
	error: clicolor.redBright,
	warning: clicolor.xterm(202),
	debug: clicolor.cyanBright,
	notice: clicolor.blueBright,
	good: clicolor.greenBright
};

gulp.task("default", ['check-server', 'watch-test-files', "watch-server-files", "check-libvirt"], function() {
    
});






gulp.task("watch-server-files", function(){
	var watcher = gulp.watch('server/**/*.js', ['check-server']);
	watcher.on('change', function(event) {
		console.log(colors.notice('\nServer file '+event.path+' was '+event.type+', linting files...\n'));
	});
});

gulp.task("watch-test-files", function() {
    var tests_watcher = gulp.watch('test/**/*.js', ['check-tests']);
   tests_watcher.on('change', function(event) {
		console.log(colors.notice('\nTest file '+event.path+' was '+event.type+', linting files...\n'));
	});
});


gulp.task("check-tests", function() {
    gulp.src("./test/**/*.js")
        .pipe(jshint())
        .pipe(jshint.reporter("default"));
});

gulp.task("check-server", function() {
    gulp.src("./server/**/*.js")
        .pipe(jshint())
        .pipe(jshint.reporter("default"));
});

gulp.task("check-libvirt", function(){
	child = exec('ps ax | grep libvirtd', function (error, stdout, stderr) {
		if (error)
			{
				console.log(error);
			}else{
				
				var result_array = stdout.split(/\n/);
				console.log();
				for (var i = 0; i < result_array.length; i++)
					{
						var line = result_array[i];
						if (line.indexOf("/libvirt")!=-1&&line.indexOf("grep")==-1)
							{
								console.log(colors.good("\nLibvirt is running\n"));
								return;
							}
						
					}
				console.log(colors.debug("\nLibvirt is NOT running\n"));
			}
	});
});
