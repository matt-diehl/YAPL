'use strict';

var chai = require('chai'),
    assert = chai.assert,
    fs = require('fs'),
    path = require('path');

var yapl = require('../index.js');

describe('yapl, post-init', function() {

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
                libraryAssetOverrideDir: './example/styleguide-assets',
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
    });

    // Config

    describe('config', function() {
        it('should be an object', function() {
            assert.isObject(yapl.config);
        });

        it('should override all default yapl assets with those in the override directory', function() {
            assert.include(yapl.config.settings.libraryAssets.hbsTemplates, 'example/styleguide-assets/hbs/templates/index.hbs');
            assert.include(yapl.config.settings.libraryAssets.hbsIndexTemplate, 'example/styleguide-assets/hbs/templates/index.hbs');
            assert.include(yapl.config.settings.libraryAssets.hbsPartials, 'example/styleguide-assets/hbs/partials/sg-block.hbs');
        });
    });


    // Sections

    describe('sections', function() {
        it('should be an object', function() {
            assert.isObject(yapl.sections);
        });
    });

    describe('sections.childObj', function() {
        it('should be an object', function() {
            assert.isObject(yapl.sections.childObj);
        });
    });

    describe('sections.childObj.init', function() {
        it('should be a function', function() {
            assert.isFunction(yapl.sections.childObj.init);
        });
    });

    describe('sections.items', function() {
        it('should be a array', function() {
            assert.isArray(yapl.sections.items);
        });
    });

    describe('sections.add', function() {
        it('should be a function', function() {
            assert.isFunction(yapl.sections.add);
        });

        it('should add an item', function() {
            yapl.sections.add(yapl.config.sections[0], {});
            assert.lengthOf(yapl.sections.items, 1);
        });

        it('should add an item with a unique id', function() {
            yapl.sections.add(yapl.config.sections[0], {});
            assert.equal(yapl.sections.items[0].id, 'section_0');
            assert.lengthOf(yapl.sections.items, 1);
            yapl.sections.add(yapl.config.sections[1], {});
            assert.equal(yapl.sections.items[1].id, 'section_1');
            assert.lengthOf(yapl.sections.items, 2);
        });

        it('should prevent adding an item with the same name', function() {
            yapl.sections.add(yapl.config.sections[0], {});
            yapl.sections.add(yapl.config.sections[0], {});
            assert.lengthOf(yapl.sections.items, 1);
        });
    });
    describe('sections.empty', function() {
        it('should remove all sections', function() {
            yapl.sections.empty();
            assert.strictEqual(yapl.sections.items.length, 0);
        });
    });


    // Modules

    describe('modules', function() {
        it('should be an object', function() {
            assert.isObject(yapl.modules);
        });
    });

    describe('modules.childObj', function() {
        it('should be an object', function() {
            assert.isObject(yapl.modules.childObj);
        });
    });

    describe('modules.childObj.init', function() {
        it('should be a function', function() {
            assert.isFunction(yapl.modules.childObj.init);
        });
    });

    describe('modules.items', function() {
        it('should be a array', function() {
            assert.isArray(yapl.modules.items);
        });

        it('should have a length of 0', function() {
            assert.lengthOf(yapl.modules.items, 0);
        });
    });

    describe('modules.add', function() {
        it('should be a function', function() {
            assert.isFunction(yapl.modules.add);
        });
    });

    describe('modules.empty', function() {
        it('should remove all modules', function() {
            yapl.modules.empty();
            assert.strictEqual(yapl.modules.items.length, 0);
        });
    });

    describe('modules.add', function() {
        it('should be a function', function() {
            assert.isFunction(yapl.modules.add);
        });

        it('should add an item with a unique id', function() {
            yapl.collectSections();
            yapl.modules.add({ cssFile: 'css/_btn.scss' }, { parent: yapl.sections.items[0] });
            assert.lengthOf(yapl.modules.items, 1);
            assert.equal(yapl.modules.items[0].id, 'module_0');
            yapl.modules.add({ cssFile: 'css/_other.scss' }, { parent: yapl.sections.items[1] });
            assert.equal(yapl.modules.items[1].id, 'module_1');
        });

    });



    // Blocks

    describe('blocks', function() {
        it('should be an object', function() {
            assert.isObject(yapl.blocks);
        });
    });

    describe('blocks.childObj', function() {
        it('should be an object', function() {
            assert.isObject(yapl.blocks.childObj);
        });
    });

    describe('blocks.childObj.init', function() {
        it('should be a function', function() {
            assert.isFunction(yapl.blocks.childObj.init);
        });
    });

    describe('blocks.items', function() {
        it('should be a array', function() {
            assert.isArray(yapl.blocks.items);
        });

        it('should have a length of 0', function() {
            assert.lengthOf(yapl.blocks.items, 0);
        });
    });

    describe('blocks.add', function() {
        it('should be a function', function() {
            assert.isFunction(yapl.blocks.add);
        });

        it('should add an item with a unique id', function() {
            yapl.collectSections();
            yapl.modules.add({ cssFile: 'css/_btn.scss' }, { parent: yapl.config.sections[0] });
            yapl.blocks.add({
                name: 'Default button',
                notes: 'The default button',
                partial: 'btn',
                context: 'btn.default',
                other: 'example of random extra data'
            }, {
                parent: yapl.modules.items[0]
            });
            assert.lengthOf(yapl.blocks.items, 1);
            assert.equal(yapl.blocks.items[0].id, 'block_0');
            yapl.blocks.add({
                name: 'Other button',
                notes: 'The other button',
                partial: 'btn',
                context: 'btn.other',
                other: 'example of random extra data'
            }, {
                parent: yapl.modules.items[0]
            });
            assert.equal(yapl.blocks.items[1].id, 'block_1');
        });

    });

    describe('blocks.empty', function() {
        it('should remove all blocks', function() {
            yapl.blocks.empty();
            assert.strictEqual(yapl.blocks.items.length, 0);
        });
    });


    // Templates

    describe('templates', function() {
        it('should be an object', function() {
            assert.isObject(yapl.templates);
        });
    });

    describe('templates.childObj', function() {
        it('should be an object', function() {
            assert.isObject(yapl.templates.childObj);
        });
    });

    describe('templates.childObj.init', function() {
        it('should be a function', function() {
            assert.isFunction(yapl.templates.childObj.init);
        });
    });

    describe('templates.items', function() {
        it('should be a array', function() {
            assert.isArray(yapl.templates.items);
        });

        it('should have a length of 0', function() {
            assert.lengthOf(yapl.templates.items, 0);
        });
    });

    describe('templates.add', function() {
        it('should be a function', function() {
            assert.isFunction(yapl.templates.add);
        });

        it('should add an item with a unique id', function() {
            yapl.templates.add({ name: 'template 1', file: __dirname + '/html/home.html' });
            assert.lengthOf(yapl.templates.items, 1);
            assert.equal(yapl.templates.items[0].id, 'template_0');
            yapl.templates.add({ name: 'template 2', file: __dirname + '/html/home.html' });
            assert.equal(yapl.templates.items[1].id, 'template_1');
        });

    });

    describe('templates.empty', function() {
        it('should remove all templates', function() {
            yapl.templates.empty();
            assert.strictEqual(yapl.templates.items.length, 0);
        });
    });


    // Images

    describe('images', function() {
        it('should be an object', function() {
            assert.isObject(yapl.images);
        });
    });

    describe('images.childObj', function() {
        it('should be an object', function() {
            assert.isObject(yapl.images.childObj);
        });
    });

    describe('images.childObj.init', function() {
        it('should be a function', function() {
            assert.isFunction(yapl.images.childObj.init);
        });
    });

    describe('images.items', function() {
        it('should be a array', function() {
            assert.isArray(yapl.images.items);
        });

        it('should have a length of 0', function() {
            assert.lengthOf(yapl.images.items, 0);
        });
    });

    describe('images.add', function() {
        it('should be a function', function() {
            assert.isFunction(yapl.images.add);
        });

        it('should add an item with a unique id', function() {
            var imagesSection = { parent: { link: '/styleguide/image-sizes.html' } };
            yapl.images.add({ src: __dirname + '/images/logo.png' }, {
                parent: imagesSection
            });
            assert.lengthOf(yapl.images.items, 1);
            assert.equal(yapl.images.items[0].id, 'image_0');
            yapl.images.add({ src: __dirname + '/images/headshot-f.png' }, {
                parent: imagesSection
            });
            assert.equal(yapl.images.items[1].id, 'image_1');
            assert.lengthOf(yapl.images.items, 2);
        });

        it('should prevent adding an item with the same src', function() {
            let imagesSection = { parent: { link: '/styleguide/image-sizes.html' } };
            yapl.images.add({ src: __dirname + '/images/logo.png' }, {
                parent: imagesSection
            });
            yapl.images.add({ src: __dirname + '/images/logo.png' }, {
                parent: imagesSection
            });
            assert.lengthOf(yapl.images.items, 1);
        });

        it('should prevent adding an item with the same dimensions', function() {
            let imagesSection = { parent: { link: '/styleguide/image-sizes.html' } };
            yapl.images.add({ src: __dirname + '/images/logo.png' }, {
                parent: imagesSection
            });
            yapl.images.add({ src: __dirname + '/images/logo2.png' }, {
                parent: imagesSection
            });
            assert.lengthOf(yapl.images.items, 1);
        });
    });

    describe('images.empty', function() {
        it('should remove all images', function() {
            yapl.images.empty();
            assert.strictEqual(yapl.images.items.length, 0);
        });
    });


    // Joins

    describe('joins', function() {
        it('should be an object', function() {
            assert.isObject(yapl.joins);
        });
    });

    describe('joins.childObj', function() {
        it('should be an object', function() {
            assert.isObject(yapl.joins.childObj);
        });
    });

    describe('joins.childObj.init', function() {
        it('should be a function', function() {
            assert.isFunction(yapl.joins.childObj.init);
        });
    });

    describe('joins.items', function() {
        it('should be a array', function() {
            assert.isArray(yapl.joins.items);
        });

        it('should have a length of 0', function() {
            assert.lengthOf(yapl.joins.items, 0);
        });
    });

    describe('joins.add', function() {
        it('should be a function', function() {
            assert.isFunction(yapl.joins.add);
        });

        it('should add an item with a unique id', function() {
            yapl.joins.add({ parent: { id: 'parent_1' }, child: { id: 'child_1' } });
            assert.lengthOf(yapl.joins.items, 1);
            assert.equal(yapl.joins.items[0].id, 'join_0');
            yapl.joins.add({ parent: { id: 'parent_2' }, child: { id: 'child_2' } });
            assert.equal(yapl.joins.items[1].id, 'join_1');
        });

    });

    describe('joins.empty', function() {
        it('should remove all joins', function() {
            yapl.joins.empty();
            assert.strictEqual(yapl.joins.items.length, 0);
        });
    });

});
