var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');


gulp.task('lint', function() {
    return gulp.src(['index.js', './lib/*.js', './js/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter(stylish));
});

gulp.task('js-frontend', function() {
    gulp.src(['./node_modules/prismjs/prism.js', './js/main.js'])
        .pipe(concat('yapl.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./js/min'))
});

gulp.task('sass', function () {
    gulp.src('./css/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./css'));
});

gulp.task('watch', function() {
    gulp.watch(['./index.js', './lib/*.js', './js/*.js', './css/**/*.scss'], ['lint', 'js-frontend', 'sass']);
});



gulp.task("default", ['lint', 'sass', 'js-frontend', 'watch']);