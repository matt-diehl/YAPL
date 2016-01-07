var chai = require('chai'),
    assert = chai.assert,
    fs = require('fs'),
    path = require('path');

var yapl = require('../index.js');


describe('yapl, post-collect', function() {

    beforeEach(function() {
        yapl.init({
            settings: {
                css: './example/css/**/*.scss',
                partials: './example/templates-main/partials/**/*.hbs',
                data: './example/templates-main/data/**/*.{json,yaml}',
                templates: './example/ProductionTemplates/**/*.html',
                buildDir: './example/styleguide',
                outputJsonFile: './example/styleguide.json',
                siteRoot: './example'
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
    });

    describe('yapl.sections', function() {
        it('should contain 5 items', function() {
            assert.lengthOf(yapl.sections.items, 5);
        });
    });

    describe('yapl.modules', function() {
        it('should contain items', function() {
            assert.isAbove(yapl.modules.items.length, 0);
        });
    });

    describe('yapl.blocks', function() {
        it('should contain items', function() {
            assert.isAbove(yapl.blocks.items.length, 0);
        });
    });

    describe('yapl.templates', function() {
        it('should contain items', function() {
            assert.isAbove(yapl.templates.items.length, 0);
        });
    });

    // describe('yapl.images', function() {
    //     it('should contain items', function() {
    //         assert.isAbove(yapl.images.items.length, 0);
    //     });
    // });

});