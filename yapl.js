'use strict';

// YAPL Requires
var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    handlebars = require('handlebars'),
    helpers = require('handlebars-helpers'),
    extend = require('node.extend'),
    yaml = require('js-yaml'),
    cheerio = require('cheerio'),
    utils = require('./lib/utils.js'),
    _ = require('lodash');

// YAPL Internal Variables
var configObj = {
    settings: {
        cssBlockRegEx: /\/\*\s*?YAPL\n([\s\S]*?)\*\//g,
        htmlBlockRegEx: /\<!--\s*?YAPL\n([\s\S]*?)--\>/g,
        outputJSONFile: false,
        css: '',
        partials: '',
        data: '',
        displayTemplates: '',
        buildDir: '',
        index: ''
    },
    sections: [],
    displayTemplates: [],
    imageSizes: []
};



// Initialize Function
function YAPL(options) {
    console.log('YAPL');
    // ============================

    // Build Prep Steps
    extendConfig(options);
    setupHandlebarsConfig();
    createAllSectionObjects();
    createAllSectionChildrenObjects();
    createAllDisplayTemplateObjects();
    createAllImageSizeObjects();

    // Section-level Build
    buildAllHtmlExamples();

    // Cross Linking
    crossLinkSectionChildren();

    // Pattern Library Build
    buildPatternLibrary();
}


// Build Prep Steps

function extendConfig(options) {
    console.log('extendConfig');
    // ============================

    configObj = extend(true, configObj, options);
}

function setupHandlebarsConfig() {
    console.log('setupHandlebarsConfig');
    // ============================
    var partials = glob.sync(configObj.settings.partials);
    // register built-in helpers
    if (helpers && helpers.register) {
        helpers.register(handlebars, {}, {});
    }
    // register all partials
    partials.forEach(function(partialPath) {
        var partialName = path.basename(partialPath, '.hbs'),
            partialContent = fs.readFileSync(partialPath, 'utf8')
        handlebars.registerHelper(partialName, partialContent);
    });
}

function createAllSectionObjects() {
    console.log('createAllSectionObjects');
    // ============================

    configObj.sections.forEach(function(section, index) {
        configObj.sections[index] = createSingleSectionObj(section);
    });
}

function createSingleSectionObj(obj) {
    console.log('createSingleSectionObj');
    // ============================

    var sectionObj = {};

    sectionObj['name'] = obj.name || 'Undefined Section';
    sectionObj['nameCamelCase'] = utils.camelCase(sectionObj['name']);
    sectionObj['nameCssCase'] = utils.cssCase(sectionObj['name']);
    sectionObj['landingTemplate'] = obj.landingTemplate || false;
    sectionObj['childTemplate'] = obj.childTemplate || false;
    sectionObj['css'] = obj.css || false;
    sectionObj['partials'] = obj.partials || configObj.settings.partials;
    sectionObj['data'] = obj.data || configObj.settings.data;
    sectionObj['link'] = sectionObj.landingTemplate ? path.join(configObj.settings.buildDir, sectionObj.nameCssCase, 'index.html') : false;
    sectionObj['cssFiles'] = sectionObj['css'] ? glob.sync(sectionObj['css']) : false;
    sectionObj['children'] = [];

    return sectionObj;
}

function createAllSectionChildrenObjects() {
    console.log('createAllSectionChildrenObjects');
    // ============================

}

function createSingleSectionChildObject(obj) {
    console.log('createSingleSectionChildObject');
    // ============================

}

function createAllDisplayTemplateObjects() {
    console.log('createAllDisplayTemplateObjects');
    // ============================

}

function createSingleDisplayTemplateObject() {
    console.log('createSingleDisplayTemplateObject');
    // ============================

}

function createAllImageSizeObjects() {
    console.log('createAllImageSizeObjects');
    // ============================

}

function createSingleImageSizeObjects() {
    console.log('createSingleImageSizeObjects');
    // ============================

}



// Section-Level Build

function buildAllHtmlExamples() {
    console.log('buildAllHtmlExamples');
    // ============================\

}

function buildSingleHtmlExample() {
    console.log('buildSingleHtmlExample');
    // ============================

}



// Cross Linking

function crossLinkSectionChildren() {
    console.log('crossLinkSectionChildren');
    // ============================

}



// Pattern Library Build

function buildPatternLibrary() {
    console.log('buildPatternLibrary');
    // ============================

}


module.exports = YAPL;











// Test Data (TEMPORARY)

YAPL({
    settings: {
        css: 'example/css/**/*.scss',
        partials: 'example/templates-main/partials/**/*.hbs',
        data: 'example/templates-main/data/**/*.{json,yaml}',
        displayTemplates: 'example/ProductionTemplates/**/*.html',
        buildDir: 'example/styleguide',
        index: 'lib/templates/index.hbs',
        outputJSONFile: 'example/styleguide.json'
    },
    sections: [{
        name: 'Micro Elements',
        landingTemplate: 'lib/templates/micro-element-landing.hbs',
        childTemplate: 'lib/templates/micro-element.hbs',
        css: 'example/css/modules/micro/**/*.scss',
    }, {
        name: 'Macro Elements',
        landingTemplate: 'lib/templates/macro-element-landing.hbs',
        childTemplate: 'lib/templates/macro-element.hbs',
        css: 'example/css/modules/macro/**/*.scss',
    }, {
        name: 'Layouts',
        landingTemplate: 'lib/templates/layouts-landing.hbs',
        childTemplate: 'lib/templates/layout.hbs',
        css: 'example/css/modules/macro/**/*.scss',
    }, {
        name: 'Display Templates',
        landingTemplate: 'lib/templates/display-templates-landing.hbs'
    }, {
        name: 'Image Sizes',
        landingTemplate: 'lib/templates/image-sizes-landing.hbs'
    }]
});