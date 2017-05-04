var gulp = require('gulp');
var server = require('gulp-server-livereload');
var templateCache = require('gulp-angular-templatecache');
var concat = require('gulp-concat');
var minify = require('gulp-minify');
var clean = require('gulp-clean');

gulp.task('webserver', function () {
    gulp.src(['.', '!.idea'])
        .pipe(server({
            defaultFile: 'app/index.html'
        }));
});

gulp.task('template', function () {
    return gulp.src('**/chart/ThreeDimChart.html')
        .pipe(templateCache({module:'TimeseriesAnalysationTool'}))
        .pipe(gulp.dest('app/temp'));
});

gulp.task('concat', ['template'], function() {
    return gulp.src(['app/app.js', 'app/chart/*.js', 'app/temp/*.js', 'app/timeseries/*.js'])
        .pipe(concat('concat.js'))
        .pipe(gulp.dest('app/temp/'));
});

gulp.task('minify', ['concat', 'template'], function() {
   return gulp.src('app/temp/concat.js')
       .pipe(minify())
       .pipe(gulp.dest('app/dist/'))
});

gulp.task('clean', ['concat', 'template', 'minify'], function () {
    return gulp.src(['app/temp'], {read: false})
        .pipe(clean());
});

gulp.task('build', ['template', 'concat', 'minify', 'clean'], function () {

});