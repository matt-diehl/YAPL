'use strict';

const fs = require('fs'),
    path = require('path'),
    handlebars = require('handlebars'),
    helpers = require('handlebars-helpers')({
        handlebars: handlebars
    }),
    layouts = require('handlebars-layouts'),
    utils = require('./utils.js');


/**
 * Compile a handlebars template and save it to a file.
 * @param  {String} filePath          Path to save the compiled template to.
 * @param  {String} templateContent   The handlebars template.
 * @param  {Object} templateData      Data to pass to the handlebars template.
 */
function hbsCompileAndSave(filePath, templateContent, templateData) {
    let hbsLandingTemplate = handlebars.compile(templateContent),
        hbsOutput = hbsLandingTemplate(templateData);

    fs.writeFileSync(filePath, hbsOutput);
}


/**
 * Task to build the pattern library site based on collected data.
 * @module yapl/task.build
 */
const build = module.exports = {

    /**
     * Initialize a new build object.
     * @param  {Object} data  Data collected from the Yapl task.
     * @return {Object}       The initialized coverage object.
     */
    init(data) {
        this.data = data;
        this.settings = data.config.settings;
        this.setupHandlebarsConfig();

        return this;
    },

    /**
     * Initialize handlebars.
     */
    setupHandlebarsConfig() {
        let libraryPartials = this.settings.libraryAssets.hbsPartials,
            libraryLayouts = this.settings.libraryAssets.hbsLayouts,
            libraryPartialsAndLayouts = [].concat(libraryPartials, libraryLayouts);

        layouts.register(handlebars);

        // Register all partials/layouts
        libraryPartialsAndLayouts.forEach(partialPath => {
            let partialName = path.basename(partialPath, '.hbs'),
                partialContent = fs.readFileSync(partialPath, 'utf8');
            handlebars.registerPartial(partialName, partialContent);
        });
    },


    /**
     * Get a library template file.
     * @param  {String} fileName  Name of the template file.
     * @return {Object}           The initialized coverage object.
     */
    getTemplateFile(fileName) {
        fileName = this.settings.libraryAssets.hbsTemplates.filter(defaultFilePath => {
            return defaultFilePath.indexOf(fileName) > -1;
        })[0];

        if (fileName) {
            return fs.readFileSync(fileName, 'utf8');
        }
    },


    /**
     * Trigger all build steps to build/save the pattern library.
     * @return {Object}  The coverage object.
     */
    build() {
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
    createBuildDir() {
        if (!fs.existsSync(this.settings.buildDir)) {
            fs.mkdirSync(this.settings.buildDir);
        }

        return this;
    },


    /**
     * Create all data to be shared among templates.
     * @return {Object}  The coverage object.
     */
    createSharedData() {
        let libSections = this.data.sections.items,
            libModules = this.data.modules.items,
            libBlocks = this.data.blocks.items,
            libTemplates = this.data.templates.items,
            libImages = this.data.images.items,
            libJoins = this.data.joins.items,
            sharedData = {};

        sharedData.settings = this.settings;

        sharedData.libCssFiles = sharedData.settings.libraryAssets.css.map(cssFile => {
            return path.join(
                utils.linkFromRoot(sharedData.settings.siteRoot, sharedData.settings.buildDir),
                path.basename(cssFile)
            );
        });

        sharedData.libJsFiles = sharedData.settings.libraryAssets.js.map(jsFile => {
            return path.join(
                utils.linkFromRoot(sharedData.settings.siteRoot, sharedData.settings.buildDir),
                path.basename(jsFile)
            );
        });

        sharedData.logoFile = path.join(
            utils.linkFromRoot(sharedData.settings.siteRoot, sharedData.settings.buildDir),
            path.basename(sharedData.settings.libraryAssets.logo[0])
        );

        sharedData.sections = libSections;

        sharedData.sectionsWChildren = libSections.filter(section => {
            return section.childTemplate;
        });

        sharedData.blocks = libBlocks.map(libBlock => {
            libBlock.references = libJoins.filter(libJoin => {
                return libJoin.child.id === libBlock.id;
            }).map(libJoin => {
                return libJoin.parent;
            });

            return libBlock;
        });

        sharedData.images = libImages.map(libImage => {
            libImage.references = libJoins.filter(libJoin => {
                return libJoin.child.id === libImage.id;
            }).map(libJoin => {
                return libJoin.parent;
            });

            return libImage;
        });

        sharedData.modules = libModules.map(libModule => {
            libModule.blocks = sharedData.blocks.filter(libBlock => {
                return libBlock.parent.id === libModule.id;
            });

            return libModule;
        }).filter(libModule => {
            return libModule.blocks.length;
        });

        sharedData.sections.map(section => {
            section.modules = sharedData.modules.filter(libModule => {
                return libModule.parent.id === section.id;
            });

            return section.modules;
        });

        sharedData.displayTemplates = libTemplates;
        let displayTemplatesSections = sharedData.sections.filter(section => {
            return section.landingTemplate.match(/display-templates-landing.hbs/);
        });

        sharedData.displayTemplatesLink = displayTemplatesSections.length ? displayTemplatesSections[0].link : undefined;

        sharedData.displayTemplates.map(displayTemplate => {
            displayTemplate.modules = libJoins.filter(libJoin => {
                return libJoin.parent.id === displayTemplate.id && libJoin.child.type === 'block';
            }).map(libJoin => {
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
    buildIndex() {
        let template = this.settings.libraryAssets.hbsIndexTemplate,
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
    buildSections() {
        this.sharedData.sections.forEach(libSection => {
            build.buildSection(libSection);
        });

        return this;
    },


    /**
     * Build an individual section of the pattern library.
     * @return {Object}  The coverage object.
     */
    buildSection(libSection) {
        let sectionDir = path.dirname(libSection.path),
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
    buildModules() {
        this.sharedData.modules.forEach(libModule => {
            build.buildModule(libModule);
        });

        return this;
    },


    /**
     * Build a single module of the pattern library.
     * @return {Object}  The coverage object.
     */
    buildModule(libModule) {
        let template = libModule.parent.childTemplate,
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


    /**
     * Copy CSS, JS, and logo assets
     * @return {Object}  The coverage object.
     */
    copyAssets() {
        let buildDir = this.settings.buildDir,
            libAssets = this.settings.libraryAssets,
            assetsToCopy = [].concat(libAssets.css, libAssets.js, libAssets.logo);

        assetsToCopy.forEach(function(assetPath) {
            utils.copyFile(assetPath, path.join(buildDir, path.basename(assetPath)));
        });

        return this;
    }

};
