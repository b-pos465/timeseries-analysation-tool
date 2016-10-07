var gulp = require('gulp');
var server = require('gulp-server-livereload');

gulp.task('webserver', function() {
    gulp.src(['.', '!.idea'])
        .pipe(server({
            open: true,
            defaultFile: 'app/index.html'
        }));
});