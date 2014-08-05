var gulp = require("gulp");
var jshint = require("gulp-jshint");

gulp.task("default", ['check-server'], function() {
    console.log("Gulp running...");
});


gulp.task("check-server", function() {
    gulp.src("./server/**/*.js")
        .pipe(jshint())
        .pipe(jshint.reporter("default"));
});

var watcher = gulp.watch('server/**/*.js', ['check-server']);
watcher.on('change', function(event) {
	console.log('File '+event.path+' was '+event.type+', running tasks...');
});

gulp.task("tests", function() {
    var tests_watcher = gulp.watch('test/**/*.js', ['check-tests']);
});


gulp.task("check-tests", function() {
    gulp.src("./test/**/*.js")
        .pipe(jshint())
        .pipe(jshint.reporter("default"));
});


