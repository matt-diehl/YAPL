'use strict';

var chai = require('chai'),
    assert = chai.assert,
    fs = require('fs'),
    path = require('path');

var yapl = require('../index.js');


describe('yapl, outputToFile', function() {

    beforeEach(function() {
        try {
            var outputFile = fs.statSync(path.join(__dirname, '../example/styleguide/yapl.json'));

            if (outputFile.isFile()) {
                fs.unlinkSync(path.join(__dirname, '../example/styleguide/yapl.json'));
            }
        } catch (e) {
            // throw e;
        }

        yapl.init({
            settings: {
                css: './example/css/**/*.scss',
                partials: './example/templates-main/partials/**/*.hbs',
                data: './example/templates-main/data/**/*.{json,yaml}',
                templates: './example/ProductionTemplates/**/*.html',
                buildDir: './example/styleguide',
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
        yapl.outputToFile();
    });

    describe('yapl.json', function() {
        it('should exist and contain content', function(done) {
            fs.stat(path.join(__dirname, '../example/styleguide/yapl.json'), function(err, stats) {
                if (err) {
                    throw err;
                }
                assert.isTrue(stats.isFile());
                assert.isAbove(stats.size, 0);
                done();
            });
        });
    });

});