'use strict';

var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    handlebars = require('handlebars'),
    helpers = require('handlebars-helpers'),
    layouts = require('handlebars-layouts'),
    utils = require('./utils.js');


/**
 * Compile a handlebars template and save it to a file.
 * @param  {String} filePath          Path to save the compiled template to.
 * @param  {String} templateContent   The handlebars template.
 * @param  {Object} templateData      Data to pass to the handlebars template.
 */
function hbsCompileAndSave(filePath, templateContent, templateData) {
    var hbsLandingTemplate = handlebars.compile(templateContent),
        hbsOutput = hbsLandingTemplate(templateData);

    fs.writeFileSync(filePath, hbsOutput);
}


/**
 * Task to build the pattern library site based on collected data.
 * @module yapl/task.build
 */
var build = module.exports = {

    /**
     * Initialize a new build object.
     * @param  {Object} data  Data collected from the Yapl task.
     * @return {Object}       The initialized coverage object.
     */
    init: function(data) {
        this.data = data;
        this.settings = data.config.settings;
        this.defaultTemplates = glob.sync(this.settings.libraryTemplates);
        this.setupHandlebarsConfig();

        return this;
    },

    /**
     * Initialize handlebars.
     */
    setupHandlebarsConfig: function() {
        var sitePartials = glob.sync(this.settings.partials),
            libraryPartials = glob.sync(this.settings.libraryPartials),
            allPartials = sitePartials.concat(libraryPartials),
            libraryLayout = this.settings.libraryLayout,
            libraryLayoutContent = fs.readFileSync(libraryLayout, 'utf8');

        // Register helpers
        if (helpers && helpers.register) {
            helpers.register(handlebars, {}, {});
        }

        // Register layout helpers
        if (layouts && layouts.register) {
            layouts.register(handlebars);
        }

        // Register all partials
        allPartials.forEach(function(partialPath) {
            var partialName = path.basename(partialPath, '.hbs'),
                partialContent = fs.readFileSync(partialPath, 'utf8');
            handlebars.registerPartial(partialName, partialContent);
        });

        // Register library layout
        handlebars.registerPartial('layout', libraryLayoutContent);
    },


	// TODO: revisit this after considering new directory structure
	// May consider searching a user's "override" directory for a matching
	// file instead of making the user provide individual paths for everything

    /**
     * Get a library template file - find override, or use the Yapl default.
     * @param  {String} fileName  Name of the template file.
     * @return {Object}           The initialized coverage object.
     */
    getTemplateFile: function(fileName) {
        if (fileName.split(path.sep).length > 1) {
            return fs.readFileSync(fileName, 'utf8');
        } else {
            fileName = this.defaultTemplates.filter(function(defaultFilePath) {
                return defaultFilePath.indexOf(fileName) > -1;
            })[0];

            if (fileName) {
                return fs.readFileSync(fileName, 'utf8');
            }
        }
    },


    /**
     * Trigger all build steps to build/save the pattern library.
     * @return {Object}  The coverage object.
     */
    build: function() {
        this.createBuildDir();
        this.createSharedData();
        this.buildIndex();
        this.buildSections();
        this.buildModules();
        this.copyAssets();

        return this;
    },


    /**
     * Create the directory where the pattern library will live.
     * @return {Object}  The coverage object.
     */
    createBuildDir: function() {
        if (!fs.existsSync(this.settings.buildDir)) {
            fs.mkdirSync(this.settings.buildDir);
        }

        return this;
    },


    /**
     * Create all data to be shared among templates.
     * @return {Object}  The coverage object.
     */
    createSharedData: function() {
        var libSections = this.data.sections.items,
            libModules = this.data.modules.items,
            libBlocks = this.data.blocks.items,
            libTemplates = this.data.templates.items,
            libImages = this.data.images.items,
            libJoins = this.data.joins.items,
            sharedData = {};

        sharedData.settings = this.settings;

        sharedData.sections = libSections;

        sharedData.sectionsWChildren = libSections.filter(function(section) {
            return section.childTemplate;
        });

        sharedData.blocks = libBlocks.map(function(libBlock) {
            libBlock.references = libJoins.filter(function(libJoin) {
                return libJoin.child.id === libBlock.id;
            }).map(function(libJoin) {
                return libJoin.parent;
            });

            return libBlock;
        });

        sharedData.images = libImages.map(function(libImage) {
            libImage.references = libJoins.filter(function(libJoin) {
                return libJoin.child.id === libImage.id;
            }).map(function(libJoin) {
                return libJoin.parent;
            });

            return libImage;
        });

        sharedData.modules = libModules.map(function(libModule) {
            libModule.blocks = sharedData.blocks.filter(function(libBlock) {
                return libBlock.parent.id === libModule.id;
            });

            return libModule;
        }).filter(function(libModule) {
            return libModule.blocks.length;
        });

        sharedData.sections.map(function(section) {
            section.modules = sharedData.modules.filter(function(libModule) {
                return libModule.parent.id === section.id;
            });

            return section.modules;
        });

        sharedData.displayTemplates = libTemplates;

        sharedData.displayTemplates.map(function(displayTemplate) {
            displayTemplate.modules = libJoins.filter(function(libJoin) {
                return libJoin.parent.id === displayTemplate.id && libJoin.child.type === 'block';
            }).map(function(libJoin) {
                return libJoin.child;
            });

            return displayTemplate.modules;
        });

        this.sharedData = sharedData;
    },


    /**
     * Build the index page of the pattern library.
     * @return {Object}  The coverage object.
     */
    buildIndex: function() {
        var template = this.settings.libraryIndex,
            templateContent = template ? this.getTemplateFile(template) : false,
            templateData = {
                title: 'Home',
                global: this.sharedData
            },
            indexPath = path.join(this.settings.buildDir, 'index.html');

        if (templateContent) {
            hbsCompileAndSave(indexPath, templateContent, templateData);
        }

        return this;
    },


    /**
     * Build the section landings of the pattern library.
     * @return {Object}  The coverage object.
     */
    buildSections: function() {
        this.sharedData.sections.forEach(function(libSection) {
            build.buildSection(libSection);
        });

        return this;
    },


    /**
     * Build an individual section of the pattern library.
     * @return {Object}  The coverage object.
     */
    buildSection: function(libSection) {
        var sectionDir = path.dirname(libSection.path),
            template = libSection.landingTemplate,
            templateContent = template ? this.getTemplateFile(template) : false,
            templateData = {
                section: libSection,
                title: libSection.name,
                link: libSection.link,
                global: this.sharedData
            };

        if (sectionDir && !fs.existsSync(sectionDir)) {
            fs.mkdirSync(sectionDir);
        }
        if (templateContent) {
            hbsCompileAndSave(libSection.path, templateContent, templateData);
        }

        return this;
    },


    /**
     * Build all the modules of the pattern library.
     * @return {Object}  The coverage object.
     */
    buildModules: function() {
        this.sharedData.modules.forEach(function(libModule) {
            build.buildModule(libModule);
        });

        return this;
    },


    /**
     * Build a single module of the pattern library.
     * @return {Object}  The coverage object.
     */
    buildModule: function(libModule) {
        var template = libModule.parent.childTemplate,
            templateContent = template ? this.getTemplateFile(template) : false,
            templateData = {
                section: libModule.parent,
                page: libModule,
                title: `${libModule.parent.name} | ${libModule.name}`,
                link: libModule.link,
                global: this.sharedData
            };

        if (templateContent) {
            hbsCompileAndSave(libModule.path, templateContent, templateData);
        }

        return this;
    },


    // TODO: revisit this

    /**
     * Copy CSS, JS, and logo assets
     * @return {Object}  The coverage object.
     */
    copyAssets: function() {
        utils.copyFile(this.settings.libraryCss, this.settings.cssOutputPath);
        utils.copyFile(this.settings.libraryJs, this.settings.jsOutputPath);
        utils.copyFile(this.settings.libraryCodeHighlightJs, this.settings.codeHighlightJsOutputPath);
        utils.copyFile(this.settings.libraryLogo, this.settings.logoOutputPath);

        return this;
    }

};
