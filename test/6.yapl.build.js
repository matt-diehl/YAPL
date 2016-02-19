var chai = require('chai'),
    assert = chai.assert,
    fs = require('fs'),
    path = require('path'),
    rimraf = require('rimraf');

var yapl = require('../index.js');


describe('yapl, build', function() {

    beforeEach(function() {
        rimraf.sync(path.resolve(__dirname, '../example/styleguide'));

        yapl.init({
            settings: {
                css: './example/css/**/*.scss',
                partials: './example/templates-main/partials/**/*.hbs',
                data: './example/templates-main/data/**/*.{json,yaml}',
                templates: './example/ProductionTemplates/**/*.html',
                buildDir: './example/styleguide',
                outputJsonFile: './example/styleguide.json',
                siteRoot: './example',
                headCssFiles: ['/css/main.css'],
                headJsFiles: ['/bower_components/modernizr/modernizr.js'],
                footerJsFiles: ['/js/main.js']
            },
            sections: [{
                name: 'Micro Elements',
                landingTemplate: 'section-landing.hbs',
                childTemplate: 'module.hbs',
                css: './example/css/modules/micro/**/*.scss',
            }, {
                name: 'Macro Elements',
                landingTemplate: 'section-landing.hbs',
                childTemplate: 'module.hbs',
                css: './example/css/modules/macro/**/*.scss'
            }, {
                name: 'Display Templates',
                landingTemplate: 'display-templates-landing.hbs'
            }, {
                name: 'Image Sizes',
                landingTemplate: 'image-sizes-landing.hbs'
            }, {
                name: 'Appendix',
                landingTemplate: 'appendix.hbs'
            }]
        });
        yapl.collect();
        yapl.build();
    });

    describe('build directory', function() {
        it('should exist', function(done) {
            fs.stat(path.resolve(__dirname, '../example/styleguide'), function(err, stats) {
                if (err) {
                    throw err;
                }
                assert.isTrue(stats.isDirectory());
                done();
            });
        });

        it('should contain an index', function(done) {
            fs.stat(path.resolve(__dirname, '../example/styleguide/index.html'), function(err, stats) {
                if (err) {
                    throw err;
                }
                assert.isTrue(stats.isFile());
                assert.isAbove(stats.size, 0);
                done();
            });
        });

        it('should contain all the specified sections (micro elements)', function(done) {
            fs.stat(path.resolve(__dirname, '../example/styleguide/micro-elements'), function(err, stats) {
                if (err) {
                    throw err;
                }
                assert.isTrue(stats.isDirectory());
                done();
            });
        });

        it('should contain all the specified sections (macro elements)', function(done) {
            fs.stat(path.resolve(__dirname, '../example/styleguide/macro-elements'), function(err, stats) {
                if (err) {
                    throw err;
                }
                assert.isTrue(stats.isDirectory());
                done();
            });
        });

        it('should contain all the specified sections (display templates)', function(done) {
            fs.stat(path.resolve(__dirname, '../example/styleguide/display-templates'), function(err, stats) {
                if (err) {
                    throw err;
                }
                assert.isTrue(stats.isDirectory());
                done();
            });
        });

        it('should contain all the specified sections (image sizes)', function(done) {
            fs.stat(path.resolve(__dirname, '../example/styleguide/image-sizes'), function(err, stats) {
                if (err) {
                    throw err;
                }
                assert.isTrue(stats.isDirectory());
                done();
            });
        });

        it('should contain all the specified sections (appendix)', function(done) {
            fs.stat(path.resolve(__dirname, '../example/styleguide/appendix'), function(err, stats) {
                if (err) {
                    throw err;
                }
                assert.isTrue(stats.isDirectory());
                done();
            });
        });

        // test for presence of section children
        // test for presence of assets (css, logo, etc.)
    });

});