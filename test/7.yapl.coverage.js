'use strict';

var chai = require('chai'),
    assert = chai.assert,
    fs = require('fs'),
    path = require('path'),
    rimraf = require('rimraf');

var yapl = require('../index.js');


describe('yapl, coverage', function() {

    beforeEach(function() {
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
        yapl.generateCoverageReport();
    });

    describe('report', function() {
        it('should be an object', function() {
            assert.isObject(yapl.coverageReport);
        });
    });

});
