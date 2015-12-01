var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    mocha = require('gulp-mocha'),
    istanbul = require('gulp-istanbul'),
    stylish = require('jshint-stylish'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    yapl = require('./index.js'),
    git = require('gulp-git'),
    bump = require('gulp-bump'),
    filter = require('gulp-filter'),
    tag_version = require('gulp-tag-version');


gulp.task('lint', function() {
    return gulp.src(['index.js', './lib/*.js', './js/*.js'])
        .pipe(jshint('./.jshintrc'))
        .pipe(jshint.reporter(stylish));
});

gulp.task('js-frontend', function() {
    gulp.src(['./node_modules/prismjs/prism.js', './js/yapl.js'])
        .pipe(uglify())
        .pipe(gulp.dest('./js/min'))
});

gulp.task('sass', function () {
    gulp.src('./css/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('./css'));
});

gulp.task('pre-test', function () {
    return gulp.src(['./lib/*.js'])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function () {
    return gulp.src(['./test/*.js'], { read: false })
        .pipe(mocha({reporter: 'nyan'}))
        .pipe(istanbul.writeReports());
});

gulp.task('build', ['lint', 'js-frontend', 'sass'], function() {
    // yapl({
    //     settings: {
    //         css: './example/css/**/*.scss',
    //         partials: './example/templates-main/partials/**/*.hbs',
    //         data: './example/templates-main/data/**/*.{json,yaml}',
    //         displayTemplates: './example/ProductionTemplates/**/*.html',
    //         buildDir: './example/styleguide',
    //         outputJsonFile: './example/styleguide.json',
    //         libraryIndex: './hbs/templates/index.hbs',
    //         libraryLayout: './hbs/layouts/default.hbs',
    //         libraryPartials: './hbs/partials/**/*.hbs',
    //         siteRoot: './example'
    //     },
    //     sections: [{
    //         name: 'Micro Elements',
    //         landingTemplate: './hbs/templates/section-landing.hbs',
    //         childTemplate: './hbs/templates/module.hbs',
    //         css: './example/css/modules/micro/**/*.scss',
    //     }, {
    //         name: 'Macro Elements',
    //         landingTemplate: './hbs/templates/section-landing.hbs',
    //         childTemplate: './hbs/templates/module.hbs',
    //         css: './example/css/modules/macro/**/*.scss'
    //     }, {
    //         name: 'Display Templates',
    //         landingTemplate: './hbs/templates/display-templates-landing.hbs'
    //     }, {
    //         name: 'Image Sizes',
    //         landingTemplate: './hbs/templates/image-sizes-landing.hbs'
    //     }, {
    //         name: 'Appendix',
    //         landingTemplate: './hbs/templates/appendix.hbs'
    //     }]
    // });
})

gulp.task('watch', function() {
    gulp.watch([
        './index.js',
        './lib/*.js',
        './js/*.js',
        './css/**/*.scss',
        './hbs/**/*.hbs'
    ], [
        'lint',
        'js-frontend',
        'sass',
        'build'
    ]);
});

gulp.task('watchtest', function() {
    gulp.watch([
        './index.js',
        './lib/*.js',
        './test/*.js'
    ], [
        'pre-test',
        'test'
    ]);
});

gulp.task('default', [
    'lint',
    'pre-test',
    'test',
    'sass',
    'js-frontend',
    'build'
]);


/**
 * Bumping version number and tagging the repository with it.
 * Please read http://semver.org/
 *
 * You can use the commands
 *
 *     gulp patch     # makes v0.1.0 → v0.1.1
 *     gulp feature   # makes v0.1.1 → v0.2.0
 *     gulp release   # makes v0.2.1 → v1.0.0
 *
 * To bump the version numbers accordingly after you did a patch,
 * introduced a feature or made a backwards-incompatible release.
 */

function inc(importance) {
    // get all the files to bump version in
    return gulp.src(['./package.json'])
        // bump the version number in those files
        .pipe(bump({type: importance}))
        // save it back to filesystem
        .pipe(gulp.dest('./'))
        // commit the changed version number
        .pipe(git.commit('bumps package version'))

        // read only one file to get the version number
        .pipe(filter('package.json'))
        // **tag it in the repository**
        .pipe(tag_version());
}

gulp.task('patch', function() { return inc('patch'); })
gulp.task('feature', function() { return inc('minor'); })
gulp.task('release', function() { return inc('major'); })
