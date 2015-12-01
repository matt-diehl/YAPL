'use strict';

// TODO - Necessary:
// - test collection of components

// TODO - Nice:
// - think about coverage idea and how that affects design decisions
    // - report at end of task on totals
// - think about using a front end framework instead of building, or making build an optional step
// - think about how caching can be applied to cross-linking (and the rest of the tasks)
    // - fs.stat: stat object has key, mtime, for when data was last modified
    // - so for each action that would involve reading file contents, can we store the results of that action, and only perform it again if the mtime has changed?
        // - could be applied to 'parse', cross-linking?
// - set up image collection parameters (max/min size, etc.)

// TODO - Maybe:
// - curried readfile

// external libs
var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    handlebars = require('handlebars'),
    helpers = require('handlebars-helpers'),
    // cheerio = require('cheerio'),
    _ = require('lodash');

// internal libs
var parse = require('./lib/parse.js'),
    utils = require('./lib/utils.js'),
    build = require('./lib/build.js');

// constructors
var Container = require('./lib/Container.js'),
    BlockObj = require('./lib/Block.js'),
    TemplateObj = require('./lib/Template'),
    ImageObj = require('./lib/Image'),
    ModuleObj = require('./lib/Module'),
    SectionObj = require('./lib/Section');

// YAPL Internal Variables
var config = {
    settings: {
        cssBlockRegEx: /\/\*\s*?YAPL\n([\s\S]*?)\*\//g,
        htmlBlockRegEx: /<!--\s*?YAPL\n([\s\S]*?)--\>/g,
        imageSizeMin: [50, 50], // currently unused
        imageExtExclude: /svg/, // currently unused
        outputJsonFile: '',
        libraryIndex: path.resolve(__dirname, 'hbs/templates/index.hbs'),
        libraryLayout: path.resolve(__dirname, 'hbs/layouts/default.hbs'),
        libraryPartials: path.resolve(__dirname, 'hbs/partials/**/*.hbs'),
        libraryTemplates: path.resolve(__dirname, 'hbs/templates/**/*.hbs'),
        libraryCss: path.resolve(__dirname, 'css/yapl.css'),
        libraryJs: path.resolve(__dirname, 'js/min/yapl.js'),
        libraryCodeHighlightJs: path.resolve(__dirname, 'js/min/prism.js'),
        libraryLogo: path.resolve(__dirname, 'images/logo.png')
    },
    sections: []
};


var Yapl = {

    init: function(options) {
        this.config = Yapl.extendConfig(options);
        parse.init({
            cssBlockRegEx: this.config.settings.cssBlockRegEx,
            htmlBlockRegEx: this.config.settings.htmlBlockRegEx
        });

        // think about how to do this better, contain to instantiated object
        Yapl.setupHandlebarsConfig();

        this.sections = Object.create(Container).init(SectionObj, 'section', this.config.settings);
        this.modules = Object.create(Container).init(ModuleObj, 'module', this.config.settings);
        this.blocks = Object.create(Container).init(BlockObj, 'block', this.config.settings);
        this.templates = Object.create(Container).init(TemplateObj, 'template', this.config.settings);
        this.images = Object.create(Container).init(ImageObj, 'image', this.config.settings);
    },

    // TODO: look into how this can be streamlined / simplified
    extendConfig: function(options) {
        var mergedConfig = _.merge(config, options),
            s = mergedConfig.settings;

        s.cssOutputPath = path.join(
            s.buildDir,
            path.basename(s.libraryCss)
        );
        s.cssSrc = path.join(
            utils.linkFromRoot(s.siteRoot, s.buildDir),
            path.basename(s.libraryCss)
        );

        s.logoOutputPath = path.join(
            s.buildDir,
            path.basename(s.libraryLogo)
        );
        s.logoSrc = path.join(
            utils.linkFromRoot(s.siteRoot, s.buildDir),
            path.basename(s.libraryLogo)
        );

        s.jsOutputPath = path.join(
            s.buildDir,
            path.basename(s.libraryJs)
        );
        s.jsSrc = path.join(
            utils.linkFromRoot(s.siteRoot, s.buildDir),
            path.basename(s.libraryJs)
        );

        s.codeHighlightJsOutputPath = path.join(
            s.buildDir,
            path.basename(s.libraryCodeHighlightJs)
        );
        s.codeHighlightJsSrc = path.join(
            utils.linkFromRoot(s.siteRoot, s.buildDir),
            path.basename(s.libraryCodeHighlightJs)
        );

        s.link = path.join(
            utils.linkFromRoot(s.siteRoot, s.buildDir),
            'index.html'
        );

        return mergedConfig;
    },

    setupHandlebarsConfig: function() {
        var partials = glob.sync(config.settings.partials);
        // register built-in helpers
        if (helpers && helpers.register) {
            helpers.register(handlebars, {}, {});
        }
        // register all partials
        partials.forEach(function(partialPath) {
            var partialName = path.basename(partialPath, '.hbs'),
                partialContent = fs.readFileSync(partialPath, 'utf8');
            handlebars.registerPartial(partialName, partialContent);
        });
    },

    collect: function() {
        Yapl.collectSections(this);
        Yapl.collectModules(this);
        Yapl.collectTemplates(this);
        Yapl.collectBlocks(this);
        //Yapl.collectImages();
    },

    // all collection functions need to take an argument to use instead of 'Yapl'
    // the argument will be the 'this' of the init function
    collectSections: function(_this) {
        _this.config.sections.forEach(function(section) {
            _this.sections.add(section, {});
        });
    },

    collectModules: function(_this) {
        _this.sections.items.forEach(function(section) {
            section.cssFiles.forEach(function(cssFile) {
                _this.modules.add({ cssFile: cssFile }, {
                    parent: section
                });
            });
        });
    },

    collectBlocks: function(_this) {
        _this.modules.items.forEach(function(module) {
            var blocks = parse.fromFile(module.cssFile, 'css');
            blocks.forEach(function(block) {
                _this.blocks.add(block, {
                    parent: module
                }).compile(handlebars);
            });
        });
    },

    collectTemplates: function(_this) {
        glob.sync(_this.config.settings.templates).forEach(function(file) {
            var template = parse.fromFile(file, 'html') || {};
            template.file = file;

            // If "exclude" present in _this block, it won't be added
            if (!template.exclude) {
                _this.templates.add(template);
            }
        });
    },

    collectImages: function(_this) {
        _this.templates.items.forEach(function(template) {

            // TODO: Do this:
            _this.images.add({});

            // var template = parse.fromFile(file, 'html') || {};
            // template.file = file;

            // // If "exclude" present in YAPL block, it won't be added
            // if (!template.exclude) {
            //     Yapl.templates.add(template);
            // }
        });
    },

    outputToFile: function() {
        var output = JSON.stringify({
            sections: this.sections.items,
            modules: this.modules.items,
            blocks: this.blocks.items,
            templates: this.templates.items
        });

        // TODO: finish this so it is configurable, creates missing directories
        fs.writeFileSync('./test/output/output.json', output);
    }

};

module.exports = Object.create(Yapl);