var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');

gulp.task('lint', function() {
    return gulp.src(['index.js', 'lib/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});

gulp.task('watch', function() {
    gulp.watch(['index.js', 'lib/*.js'], ['lint']);
});

gulp.task("default", ['lint', 'watch']);