'use strict';

// YAPL Requires
var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    assemble = require('assemble'),
    handlebars = require('handlebars'),
    helpers = require('handlebars-helpers'),
    extend = require('node.extend'),
    yaml = require('js-yaml'),
    cheerio = require('cheerio'),
    utils = require('./lib/utils.js'),
    _ = require('lodash');

// YAPL Internal Variables
var config = {
    settings: {
        cssBlockRegEx: /\/\*\s*?YAPL\n([\s\S]*?)\*\//g,
        htmlBlockRegEx: /\<!--\s*?YAPL\n([\s\S]*?)--\>/g,
        outputJsonFile: false
    },
    sections: [],
    displayTemplates: [],
    imageSizes: []
};



// Initialize Function
function YAPL(options) {
    //console.log('YAPL');
    // ============================

    // Build Prep Steps
    extendConfig(options);
    setupHandlebarsConfig();
    setupAssembleConfig();
    createAllSectionObjects();
    //-> createSingleSectionObj
        //-> createAllSectionChildrenObjects
            //-> createSingleSectionChildObject
                //-> parseYAPLJsonFromFile
                    //-> createSingleCssYAPLBlockObject
    createAllDisplayTemplateObjects();
    //-> createSingleDisplayTemplateObject
        //-> parseYAPLJsonFromFile

    // Section-level Build
    buildAllHtmlExamples();

    createAllImageSizeObjects(); // incomplete
        //-> createSingleImageSizeOject

    // Cross Linking
    crossLinkSectionChildren(); // incomplete

    // Output JSON to file if set as option
    outputConfigToFile();

    // Pattern Library Build
    buildPatternLibrary(); // incomplete

}


// Build Prep Steps

function extendConfig(options) {
    //console.log('extendConfig');
    // ============================

    config = extend(true, config, options);
}

function setupHandlebarsConfig() {
    //console.log('setupHandlebarsConfig');
    // ============================

    var partials = glob.sync(config.settings.partials);
    // register built-in helpers
    if (helpers && helpers.register) {
        helpers.register(handlebars, {}, {});
    }
    // register all partials
    partials.forEach(function(partialPath) {
        var partialName = path.basename(partialPath, '.hbs'),
            partialContent = fs.readFileSync(partialPath, 'utf8')
        handlebars.registerPartial(partialName, partialContent);
    });
}

function setupAssembleConfig() {
    //console.log('setupAssembleConfig');
    // ============================

}

function createAllSectionObjects() {
    //console.log('createAllSectionObjects');
    // ============================

    config.sections.forEach(function(section, index) {
        config.sections[index] = createSingleSectionObj(section);
    });
}

function createSingleSectionObj(obj) {
    //console.log('createSingleSectionObj');
    // ============================

    var sectionObject = {};

    sectionObject['name'] = obj.name || 'Undefined Section';
    sectionObject['nameCamelCase'] = utils.camelCase(sectionObject['name']);
    sectionObject['nameCssCase'] = utils.cssCase(sectionObject['name']);
    sectionObject['landingTemplate'] = obj.landingTemplate || false;
    sectionObject['childTemplate'] = obj.childTemplate || false;
    sectionObject['css'] = obj.css || false;
    sectionObject['cssFiles'] = sectionObject['css'] ? glob.sync(sectionObject['css']) : false;
    sectionObject['partials'] = obj.partials || config.settings.partials;
    sectionObject['partialFiles'] = sectionObject['partials'] ? glob.sync(sectionObject['partials']) : false;
    sectionObject['data'] = obj.data || config.settings.data;
    sectionObject['dataFiles'] = sectionObject['data'] ? glob.sync(sectionObject['data']) : false;
    sectionObject['link'] = sectionObject.landingTemplate ? path.join(config.settings.buildDir, sectionObject.nameCssCase, 'index.html') : false;
    sectionObject['children'] = sectionObject['cssFiles'] ? createAllSectionChildrenObjects(sectionObject['cssFiles'], sectionObject.nameCssCase) : false;

    return sectionObject;
}

function createAllSectionChildrenObjects(cssFiles, sectionName) {
    //console.log('createAllSectionChildrenObjects');
    // ============================

    var childrenObjects = [];

    cssFiles.forEach(function(cssFile) {
        var childObject = createSingleSectionChildObject(cssFile, sectionName);
        childObject && childrenObjects.push(childObject);
    });

    return childrenObjects;
}

function createSingleSectionChildObject(cssFile, sectionName) {
    //console.log('createSingleSectionChildObject');
    // ============================

    var childObject = {},
        cssFileExt = path.extname(cssFile),
        cssFileBasename = path.basename(cssFile, cssFileExt).replace('_', ''),
        childObjectFilename = cssFileBasename + '.html';

    childObject['name'] = utils.titleCase(cssFileBasename);
    childObject['nameCamelCase'] = utils.camelCase(cssFileBasename);
    childObject['nameCssCase'] = cssFileBasename;
    childObject['link'] = path.join(config.settings.buildDir, sectionName, childObjectFilename);
    childObject['partial'] = cssFileBasename;
    childObject['blocks'] = parseYAPLJsonFromFile(cssFile, childObject);

    if (childObject['blocks'] && childObject['blocks'].length) {
        return childObject;
    }
}

function createAllDisplayTemplateObjects() {
    //console.log('createAllDisplayTemplateObjects');
    // ============================

    var displayTemplateFiles = glob.sync(config.settings.displayTemplates),
        displayTemplatesArray = [];

    displayTemplateFiles.forEach(function(file) {
        var displayTemplateObject = createSingleDisplayTemplateObject(file);
        displayTemplatesArray.push(displayTemplateObject);
    });

    config.displayTemplates = displayTemplatesArray;
}

function createSingleDisplayTemplateObject(file) {
    //console.log('createSingleDisplayTemplateObject');
    // ============================

    var displayTemplateObject = parseYAPLJsonFromFile(file) || {},
        fileExt = path.extname(file),
        fileBasename = path.basename(file, fileExt);

    displayTemplateObject['name'] = displayTemplateObject.name || utils.titleCase(fileBasename);
    displayTemplateObject['group'] = 'default';
    displayTemplateObject['link'] = file;
    displayTemplateObject['hide'] = false;

    return displayTemplateObject;
}

function createAllImageSizeObjects() {
    //console.log('createAllImageSizeObjects');
    // ============================

    var imageSizeObjectsAll = [], // All image objects
        imageSizeObjectGroups = [], // Image objects grouped by size
        imageSizeObjectsCondensed = []; // Images reduced to unique, with combined references

    // Loop through sections/modules to find images
    config.sections.forEach(function(section) {
        if (section.children && section.children.length) {
            section.children.forEach(function(sectionChild) {
                if (sectionChild.blocks && sectionChild.blocks.length) {
                    sectionChild.blocks.forEach(function(block) {

                        if (block.html) {
                            var imageUrls = getAllImageUrlsFromHtml(block.html);
                            imageUrls.forEach(function(imageUrl) {
                                var imageSizeObject = imageSizeObject = createSingleImageSizeObject(imageUrl, section, sectionChild);
                                imageSizeObjectsAll.push(imageSizeObject);
                            });
                        }

                    });
                }
            });
        }
    });

    // Loop through display templates to find images
    config.displayTemplates.forEach(function(displayTemplate) {
        fs.readFile(displayTemplate.link, function(err, html) {
            if (err) {
                return false;
            }
            var imageUrls = getAllImageUrlsFromHtml(html);
            imageUrls.forEach(function(imageUrl) {
                var imageSizeObject = imageSizeObject = createSingleImageSizeObject(imageUrl);
                imageSizeObjectsAll.push(imageSizeObject);
            });
        });
    });

    // Sort/Merge Image Objects
    imageSizeObjectGroups = _.chain(imageSizeObjectsAll)
        .groupBy(function(object) {
            return object.dimensions;
        })
        .sortBy('dimensions')
        .value();

    imageSizeObjectGroups.forEach(function(group, index, arr) {
        var mergedImageObject = {};

        group.forEach(function(imageObject) {
            _.merge(mergedImageObject, imageObject);
        });
        imageSizeObjectsCondensed.push(mergedImageObject);
    });

    config.imageSizes = imageSizeObjectsCondensed;

}

// TODO: Fix weirdness of using for both sections and display templates
function createSingleImageSizeObject(imageUrl, section, sectionChild) {
    //console.log('createSingleImageSizeObject');
    // ============================

    var imageObject = {};

    imageObject['dimensions'] = utils.dimensions(imageUrl);
    imageObject['ratio'] = utils.aspectRatio(imageObject['dimensions']);
    imageObject['html'] = utils.placeholderImage(imageObject['dimensions']);
    imageObject['references'] = {
        sections: [{
            name: section ? section.name : '',
            children: section ? [sectionChild] : []
        }]
    };

    return imageObject;
}

function getAllImageUrlsFromHtml(html) {
    var $ = cheerio.load(html),
        images = $('img'),
        imageUrlArray = [];

    images.each(function(i, elem) {
        var imageUrl = path.join(config.settings.siteRoot, $(this).attr('src'));
        imageUrlArray.push(imageUrl);
    });

    return imageUrlArray;
}



function parseYAPLJsonFromFile(file, blockParent) {
    //console.log('parseYAPLBlocksFromContent');
    // ============================

    var fileExt = path.extname(file),
        fileContent = fs.readFileSync(file, 'utf8'),
        regEx = _.contains(fileExt, 'html') ? config.settings.htmlBlockRegEx :
                _.contains(fileExt, 'css') ? config.settings.cssBlockRegEx : false,
        YAPLBlocks = fileContent.match(regEx),
        YAPLJson = [];

    if (YAPLBlocks && YAPLBlocks.length) {
        YAPLBlocks.forEach(function(YAPLBlock) {
            var yamlString,
                json;

            yamlString = YAPLBlock.replace(regEx, function(match, p1) {
                return p1;
            });

            json = yaml.safeLoad(yamlString);

            if (_.contains(fileExt, 'css')) {
                json = createSingleCssYAPLBlockObject(json, blockParent);
                YAPLJson.push(json);
            } else if (_.contains(fileExt, 'html')) {
                // HTML files only contain one YAPL block
                YAPLJson = json;
            }

        });
        return YAPLJson;
    }
}

function createSingleCssYAPLBlockObject(obj, blockParent) {
    var blockObj = {};

    blockObj['name'] = obj.name || 'Undefined Name';
    blockObj['nameCamelCase'] = utils.camelCase(blockObj.name);
    blockObj['nameCssCase'] = utils.cssCase(blockObj.name);
    blockObj['notes'] = obj.notes || false;
    blockObj['partial'] = obj.partial || blockParent.partial;
    blockObj['context'] = obj.context || false;
    blockObj['selector'] = obj.selector || false;
    blockObj['link'] = blockParent.link + '#' + blockObj.nameCssCase;

    return blockObj;
}



// Section-Level Build

function buildAllHtmlExamples() {
    //console.log('buildAllHtmlExamples');
    // ============================

    config.sections.forEach(function(section) {
        if (section.children && section.children.length) {
            section.children.forEach(function(sectionChild) {
                if (sectionChild.blocks && sectionChild.blocks.length) {
                    sectionChild.blocks.forEach(function(block) {

                        block['html'] = buildSingleHtmlExample(block, section);

                    });
                }
            });
        }
    });
}

function buildSingleHtmlExample(block, section) {
    //console.log('buildSingleHtmlExample');
    // ============================

    var partialFile,
        partialFileContent,
        dataFile,
        dataFileContent,
        blockContextRoot = block.context && block.context.split('.')[0],
        blockContextTip = block.context && block.context.split('.')[1],
        blockContextJson = '',
        template,
        html;

    partialFile = _.find(section.partialFiles, function(file) {
        var fileExt = path.extname(file),
            fileBasename = path.basename(file, fileExt);
        return block.partial === fileBasename;
    });

    if (partialFile) {
        partialFileContent = fs.readFileSync(partialFile, 'utf8');
    }

    if (block.context) {
        dataFile = _.find(section.dataFiles, function(file) {
            var fileExt = path.extname(file),
                fileBasename = path.basename(file, fileExt);
            return blockContextRoot === fileBasename;
        });
    }

    if (dataFile) {
        dataFileContent = fs.readFileSync(dataFile, 'utf8');
        if (path.extname(dataFile) === '.yaml') {
            blockContextJson = yaml.safeLoad(dataFileContent)[blockContextTip];
        } else if (path.extname(dataFile) === '.json') {
            blockContextJson = JSON.parse(dataFileContent)[blockContextTip];
        }
    }

    if (partialFileContent) {
        template = handlebars.compile(partialFileContent);
        html = template(blockContextJson);
        html = html.replace(/^\s+|\s+$/g, '');
        html = html.replace(/\n+/g, '\n');
        return html;
    }

}



// Cross Linking

function crossLinkSectionChildren() {
    //console.log('crossLinkSectionChildren');
    // ============================

}



function outputConfigToFile() {
    //console.log('outputConfigToFile');
    // ============================

    var outputPath = config.settings.outputJsonFile,
        outputDir = path.dirname(outputPath),
        outputFilename = path.basename(outputPath)

    fs.exists(outputDir, function(exists) {
        if (!exists) {
            fs.mkdirSync(outputDir);
        }
        fs.writeFileSync(config.settings.outputJsonFile, JSON.stringify(config));
    });
}



// Pattern Library Build

function buildPatternLibrary() {
    //console.log('buildPatternLibrary');
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
        indexTemplate: 'lib/templates/index.hbs',
        outputJsonFile: 'example/styleguide.json',
        libraryLayout: 'example/templates-styleguide/layouts/default.hbs',
        libraryPartials: 'example/templates-styleguide/partials/**/*.hbs',
        siteRoot: 'example' // TODO: Any better way to handle this?
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
        css: 'example/css/modules/macro/**/*.scss'
    }, {
        name: 'Layouts',
        landingTemplate: 'lib/templates/layouts-landing.hbs',
        childTemplate: 'lib/templates/layout.hbs'
    }, {
        name: 'Display Templates',
        landingTemplate: 'lib/templates/display-templates-landing.hbs'
    }, {
        name: 'Image Sizes',
        landingTemplate: 'lib/templates/image-sizes-landing.hbs'
    }, {
        name: 'Appendix',
        landingTemplate: 'lib/templates/appendix.hbs'
    }]
});