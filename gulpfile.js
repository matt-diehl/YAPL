var gulp = require('gulp');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var yapl = require('./index.js');


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

gulp.task('build', ['lint', 'js-frontend', 'sass'], function() {
    yapl({
        settings: {
            css: './example/css/**/*.scss',
            partials: './example/templates-main/partials/**/*.hbs',
            data: './example/templates-main/data/**/*.{json,yaml}',
            displayTemplates: './example/ProductionTemplates/**/*.html',
            buildDir: './example/styleguide',
            outputJsonFile: './example/styleguide.json',
            libraryIndex: './hbs/templates/index.hbs',
            libraryLayout: './hbs/layouts/default.hbs',
            libraryPartials: './hbs/partials/**/*.hbs',
            siteRoot: './example'
        },
        sections: [{
            name: 'Micro Elements',
            landingTemplate: './hbs/templates/section-landing.hbs',
            childTemplate: './hbs/templates/module.hbs',
            css: './example/css/modules/micro/**/*.scss',
        }, {
            name: 'Macro Elements',
            landingTemplate: './hbs/templates/section-landing.hbs',
            childTemplate: './hbs/templates/module.hbs',
            css: './example/css/modules/macro/**/*.scss'
        }, {
            name: 'Display Templates',
            landingTemplate: './hbs/templates/display-templates-landing.hbs'
        }, {
            name: 'Image Sizes',
            landingTemplate: './hbs/templates/image-sizes-landing.hbs'
        }, {
            name: 'Appendix',
            landingTemplate: './hbs/templates/appendix.hbs'
        }]
    });
})

gulp.task('watch', function() {
    gulp.watch(['./index.js', './lib/*.js', './js/*.js', './css/**/*.scss', './hbs/**/*.hbs'], ['lint', 'js-frontend', 'sass', 'build']);
});

gulp.task('default', ['lint', 'sass', 'js-frontend', 'watch', 'build']);