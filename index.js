'use strict';

// external libs
const fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    handlebars = require('handlebars'),
    helpers = require('handlebars-helpers'),
    _ = require('lodash');

// internal libs
const parse = require('./lib/task.parse.js'),
    build = require('./lib/task.build.js'),
    coverage = require('./lib/task.coverage.js'),
    outputJson = require('./lib/task.outputJson.js'),
    utils = require('./lib/utils.js');

// constructors/objects
const ContainerObj = require('./lib/obj.container.js'),
    BlockObj = require('./lib/obj.block.js'),
    TemplateObj = require('./lib/obj.template.js'),
    ImageObj = require('./lib/obj.image.js'),
    ModuleObj = require('./lib/obj.module.js'),
    SectionObj = require('./lib/obj.section.js'),
    JoinObj = require('./lib/obj.join.js');

// Yapl base configuration
const baseConfig = {
    settings: {
        cssBlockRegEx: /\/\*\s*?YAPL\n([\s\S]*?)\*\//g,
        htmlBlockRegEx: /<!--\s*?YAPL\n([\s\S]*?)--\>/g,
        imageSizeMin: [50, 50], // TODO: document new option
        imageExtExclude: /svg/, // TODO: document new option
        outputJsonFile: '',
        libraryAssetDir: path.resolve(__dirname, 'front-end'),
        libraryAssets: {
            hbsTemplates: 'hbs/templates/**/*.hbs',
            hbsIndexTemplate: 'hbs/templates/index.hbs',
            hbsLayouts: 'hbs/layouts/*.hbs',
            hbsPartials: 'hbs/partials/**/*.hbs',
            css: 'css/*.css',
            js: 'js/min/*.js',
            logo: 'images/logo.png'
        }
    },
    sections: []
};


/**
 * Yapl
 * @module yapl
 */
const Yapl = {

    /**
     * Initialize a new Yapl object.
     * @param  {Object} options  Options to pass to the initialization.
     * @return {Object}          The initialized Yapl object.
     */
    init(options) {
        this.config = Yapl.extendConfig(options);
        this.testConfig();

        parse.init({
            cssBlockRegEx: this.config.settings.cssBlockRegEx,
            htmlBlockRegEx: this.config.settings.htmlBlockRegEx
        });

        // think about how to do this better, contain to instantiated object
        this.setupHandlebarsConfig();

        this.sections = Object.create(ContainerObj).init(SectionObj, 'section', this.config.settings);
        this.modules = Object.create(ContainerObj).init(ModuleObj, 'module', this.config.settings);
        this.blocks = Object.create(ContainerObj).init(BlockObj, 'block', this.config.settings);
        this.templates = Object.create(ContainerObj).init(TemplateObj, 'template', this.config.settings);
        this.images = Object.create(ContainerObj).init(ImageObj, 'image', this.config.settings);
        this.joins = Object.create(ContainerObj).init(JoinObj, 'join', this.config.settings);

        return this;
    },


    /**
     * Extend the base configuration settings with passed options.
     * @param  {Object} options  Options to pass to the initialization.
     * @return {Object}          The extended configuration object.
     */
    extendConfig(options) {
        let mergedConfig = _.merge({}, baseConfig, options),
            s = mergedConfig.settings,
            assets = {},
            overrideAssets = {};

        // Grab all default asset paths
        Object.keys(s.libraryAssets).forEach(assetKey => {
            assets[assetKey] = path.join(
                s.libraryAssetDir,
                s.libraryAssets[assetKey]
            );

            assets[assetKey] = glob.sync(assets[assetKey]);
        });

        // Find any override asset paths
        if (s.libraryAssetOverrideDir) {
            Object.keys(s.libraryAssets).forEach(assetKey => {
                overrideAssets[assetKey] = path.join(
                    s.libraryAssetOverrideDir,
                    s.libraryAssets[assetKey]
                );

                overrideAssets[assetKey] = glob.sync(overrideAssets[assetKey]);
            });
        }

        // Merge the default asset paths with the overrides
        s.libraryAssets = _.merge({}, assets, overrideAssets);

        s.link = path.join(
            utils.linkFromRoot(s.siteRoot, s.buildDir),
            'index.html'
        );

        return mergedConfig;
    },


    /**
     * Test that all required settings/parameters are included for Yapl to work.
     */
    testConfig() {
        if (!this.config.settings.partials) {
            throw new Error('settings.partials is a required parameter');
        }
        if (!this.config.settings.templates) {
            throw new Error('settings.templates is a required parameter');
        }
        if (!this.config.settings.buildDir) {
            throw new Error('settings.buildDir is a required parameter');
        }
        if (!this.config.sections.length) {
            throw new Error('at least one section is required');
        }
    },

    // TODO: any way to make this more flexible - pass in options about helpers, not make handlebars mandatory?

    /**
     * Set up handlebars partials, register helpers, etc.
     */
    setupHandlebarsConfig() {
        let partials = glob.sync(this.config.settings.partials);
        // register built-in helpers
        if (helpers && helpers.register) {
            helpers.register(handlebars, {}, {});
        }
        // register all partials
        partials.forEach(partialPath => {
            let partialName = path.basename(partialPath, '.hbs'),
                partialContent = fs.readFileSync(partialPath, 'utf8');
            handlebars.registerPartial(partialName, partialContent);
        });
    },


    /**
     * Search files based on configuration and collect Yapl comments/data.
     * @return {Object}  The Yapl object with collected data.
     */
    collect() {
        this.collectSections();
        this.collectModules();
        this.collectTemplates();
        this.collectBlocks();
        this.collectImages();
        this.collectJoins();

        return this;
    },


    /**
     * Collect all sections and add to Yapl.
     */
    collectSections() {
        let _this = this;

        _this.config.sections.forEach(section => {
            _this.sections.add(section, {});
        });
    },


    /**
     * Collect all modules and add to Yapl.
     */
    collectModules() {
        let _this = this;

        _this.sections.forEach(section => {
            section.cssFiles.forEach(cssFile => {
                _this.modules.add({ cssFile: cssFile }, {
                    parent: section
                });
            });
        });

        _this.modules.sortAlpha('name');
    },


    /**
     * Collect all blocks and add to Yapl.
     */
    collectBlocks() {
        let _this = this;

        _this.modules.forEach(module => {
            let blocks = parse.fromFile(module.cssFile, 'css');
            blocks.forEach(block => {
                _this.blocks.add(block, {
                    parent: module,
                    compiler: handlebars
                });
            });
        });

        _this.blocks.sortAlpha('name');
    },


    /**
     * Collect all templates and add to Yapl.
     */
    collectTemplates() {
        let _this = this;

        glob.sync(_this.config.settings.templates).forEach(file => {
            let template = parse.fromFile(file, 'html')[0] || {};
            template.file = file;

            // If "exclude" present in _this block, it won't be added
            if (!template.exclude) {
                _this.templates.add(template);
            }
        });

        _this.templates.sortAlpha('name');
    },


    /**
     * Collect all images (sizes) found in templates and blocks and add to Yapl.
     */
    collectImages() {
        let _this = this,
            images = [],
            blocksAndTemplates = _this.blocks.items.concat(_this.templates.items),
            imagesSection = _this.sections.items.filter(section => {
                return section.landingTemplate === 'image-sizes-landing.hbs';
            })[0];

        blocksAndTemplates.forEach(blockOrTemplate => {
            if (blockOrTemplate.html) {
                let imagePaths = utils.getImagePathsFromHtml(blockOrTemplate.html, _this.config.settings.siteRoot);
                images = images.concat(imagePaths);
            }
        });

        images.forEach(image => {
            _this.images.add({ src: image }, {
                parent: imagesSection
            });
        });

        _this.images.sortNumeric('width');
    },


    /**
     * Collect joins/relationships between modules, templates, and images
     */
    collectJoins() {
        let _this = this,
            allSelectors = [],
            blocksAndTemplates = _this.blocks.items.concat(_this.templates.items);

        allSelectors = _this.blocks.items.filter(block => {
            return block.selector;
        }).map(function(block) {
            return block.selector;
        });

        // Find modules and images in templates and modules
        blocksAndTemplates.forEach(blockOrTemplate => {
            if (blockOrTemplate.html) {
                let matches = [],
                    selectorMatches = utils.findMatchingSelectors(blockOrTemplate.html, allSelectors),
                    imageMatches = utils.getImageDimensionsFromHtml(blockOrTemplate.html, _this.config.settings.siteRoot);

                // For all selectors found in the block or template HTML
                // filter out that have the exact same selector
                selectorMatches = selectorMatches.filter(match => {
                    return match !== blockOrTemplate.selector;

                // then transform each selector into the block that it matches
                }).map(match => {
                    return _this.blocks.items.filter(block => {
                        return match === block.selector;
                    });
                });

                // For all images found in the block or template HTML
                // transform it into the image object that it matches
                imageMatches = imageMatches.map(match => {
                    return _this.images.items.filter(image => {
                        return image.width === match[0] && image.height === match[1];
                    });
                });

                // concat all the selectorMatches and imageMatches, but remove any empty arrays
                matches = matches.concat(selectorMatches, imageMatches).filter(match => {
                    return match.length;
                }).map(match => {
                    return match[0];
                });

                matches.forEach(match => {
                    _this.joins.add({
                        parent: blockOrTemplate,
                        child: match
                    });
                });
            }
        });

    },


    /**
     * Build the pattern library.
     * @return {Object}  The Yapl object.
     */
    build() {
        build.init(this);
        build.build();

        return this;
    },


    /**
     * Generate a coverage report of how well documented the site components are.
     * @return {Object}  The Yapl object, with reports added.
     */
    generateCoverageReport() {
        coverage.init(this);
        coverage.generateReport();
        coverage.generateTextReport();

        console.log(coverage.textReport);

        this.coverageReport = coverage.report;
        this.textCoverageReport = coverage.textReport;

        return this;
    },


    /**
     * Save the core pattern library components to a JSON file.
     */
    outputToFile() {
        outputJson.init(this);
        outputJson.output();
    }

};

module.exports = Object.create(Yapl);
