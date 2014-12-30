/*jslint node: true */

'use strict';


var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    handlebars = require('handlebars'),
    helpers = require('handlebars-helpers'),
    layouts = require('handlebars-layouts'),
    utils = require('./utils.js');

/**
 * Takes the pattern library object and builds/saves the files that make up the pattern library.
 * @param  {Object} config Object to be built into the pattern library.
 */
module.exports = function(config) {

    // Steps
    setupHandlebarsConfig();
    createBuildDir();
    buildIndex();
    buildSections();
        //-> buildSingleSection
    buildSectionChildren();
        //-> buildSingleSectionChild
    copyAssets();



    function setupHandlebarsConfig() {
        var sitePartials = glob.sync(config.settings.partials),
            libraryPartials = glob.sync(config.settings.libraryPartials),
            allPartials = sitePartials.concat(libraryPartials),
            libraryLayout = config.settings.libraryLayout,
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
    }

    function createBuildDir() {
        if (!fs.existsSync(config.settings.buildDir)) {
            fs.mkdirSync(config.settings.buildDir);
        }
    }

    function buildIndex() {
        var template = config.settings.libraryIndex,
            templateContent = template ? fs.readFileSync(template, 'utf8') : false,
            templateData = {
                library: config,
                title: 'Home'
            },
            indexPath = path.join(config.settings.buildDir, 'index.html');
        if (templateContent) {
            hbsCompileAndSave(indexPath, templateContent, templateData);
        }
    }

    function buildSections() {
        config.sections.forEach(function(section) {
            buildSingleSection(section);
        });
    }

    function buildSingleSection(section) {
        var sectionDir = path.dirname(section.path),
            template = section.landingTemplate,
            templateContent = template ? fs.readFileSync(template, 'utf8') : false,
            templateData = {
                library: config,
                section: section,
                title: section.name,
                link: section.link
            };

        if (sectionDir && !fs.existsSync(sectionDir)) {
            fs.mkdirSync(sectionDir);
        }
        if (templateContent) {
            hbsCompileAndSave(section.path, templateContent, templateData);
        }
    }

    function buildSectionChildren() {
        config.sections.forEach(function(section) {
            if (section.children && section.children.length) {
                section.children.forEach(function(sectionChild) {
                    buildSingleSectionChild(section, sectionChild);
                });
            }
        });
    }

    function buildSingleSectionChild(section, sectionChild) {
        var template = section.childTemplate,
            templateContent = template ? fs.readFileSync(template, 'utf8') : false,
            templateData = {
                library: config,
                section: section,
                page: sectionChild,
                title: section.name + ' | ' + sectionChild.name,
                link: sectionChild.link
            };

        if (templateContent) {
            hbsCompileAndSave(sectionChild.path, templateContent, templateData);
        }
    }

    function hbsCompileAndSave(filePath, templateContent, templateData) {
        var hbsLandingTemplate = handlebars.compile(templateContent),
            hbsOutput = hbsLandingTemplate(templateData);

        fs.writeFileSync(filePath, hbsOutput);
    }

    function copyAssets() {
        var cssFilename = path.basename(config.settings.libraryCss),
            cssOutputPath = path.join(config.settings.buildDir, cssFilename),
            logoFilename = path.basename(config.settings.libraryLogo),
            logoOutputPath = path.join(config.settings.buildDir, logoFilename),
            jsFilename = path.basename(config.settings.libraryJs),
            jsOutputPath = path.join(config.settings.buildDir, jsFilename);
        utils.copyFile(config.settings.libraryCss, cssOutputPath);
        utils.copyFile(config.settings.libraryJs, jsOutputPath);
        utils.copyFile(config.settings.libraryLogo, logoOutputPath);
    }

};
