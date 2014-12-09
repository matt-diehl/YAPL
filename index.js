
/**
 * YET ANOTHER PATTERN LIBRARY
 *
 * Steps:
 * - Create a "styles" object, broken down by the folder structure of that containing all of the CSS (base, layout, modules, etc.)
 * - Find all source files containing style guide YAML blocks, and add them to the "styles" object (layout.header, modules.micro.btn, etc.)
 * - For each file, create an array of objects (using js-yaml), one for each style guide YAML block
 * - For each object in the array, check if there is an associated handlebars partial (as well as data/context)
 * - If there if an associated handlebars partial, compile the example, clean it up, and add it to the object
 *
 * Options:
 * - Directories to css, partials, and data
 * - Regular expression for finding style guide blocks in css
 * - Whether to save "styles" object as JSON file, and what to call it
 *
 */


// Requires
var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    handlebars = require('handlebars'),
    helpers = require('handlebars-helpers'),
    yaml = require('js-yaml'),
    extend = require('node.extend'),
    cheerio = require('cheerio');

// register built-in helpers
if (helpers && helpers.register) {
    helpers.register(handlebars, {}, {});
}


var YAPL = (function() {
    var files = {},
        styles = {},
        s;

    return {

        // Default settings
        // Other settings passed as arguments in init include:
        // - cssDir (mandatory)
        // - partialsDir (optional)
        // - templatesDir (optional)
        // - dataDir (optional)
        settings: {
            cssBlockRegEx: /\/\*\s*?YAPL\n([\s\S]*?)\*\//g,
            htmlBlockRegEx: /\<!--\s*?YAPL\n([\s\S]*?)--\>/g,
            outputFile: false
        },

        init: function(options) {
            s = extend({}, this.settings, options);

            // Only continue if a css directory was spec'd
            if (s.cssDir) {
                this.getFiles();
                this.gatherCssJSON();
                s.templatesDir && this.gatherTemplateJSON();
                s.outputFile && this.saveJSONFile();
                return styles;
            } else {
                console.log('No CSS directory was specified');
            }
        },

        getFiles: function() {
            files.css = glob.sync(s.cssDir + '/**/*.{css,scss}');
            files.templates = glob.sync(s.templatesDir + '/**/*.html');
        },

        gatherCssJSON: function() {
            // Loop through each of the css files
            for (var index in files.css) {
                var filePath = files.css[index],
                    filePathBase = path.basename(filePath, '.scss').replace('_', ''),
                    filePathBaseCamelized = filePathBase.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); }),
                    filePathArray = path.dirname(filePath).split('/'),
                    fileParent = filePathArray[filePathArray.length - 1],
                    fileContent = fs.readFileSync(filePath, 'utf8'),
                    YAPLBlocks = fileContent.match(s.cssBlockRegEx),
                    sgBlocks = [];

                if (YAPLBlocks && YAPLBlocks.length) {
                    YAPLBlocks.forEach(function(val) {
                        var newString = val.replace(/\/\*\s*?YAPL\n/, ''),
                            json;
                        newString = newString.replace('*/', '');
                        json = yaml.safeLoad(newString);

                        if (s.partialsDir) {
                            // If a specific partial wasn't spec'd, use the css file name
                            var partial = json.partial || filePathBase;
                            json.example = YAPL.compileHtmlExample(partial, json.context);
                        }

                        sgBlocks.push(json);
                    });

                    // Create an object for the current module if one doesn't already exist
                    styles[fileParent] = styles[fileParent] ? styles[fileParent] : {};

                    // Save module info and array of blocks to the master styles object
                    styles[fileParent][filePathBaseCamelized] = {
                        name: filePathBase,
                        parent: fileParent,
                        path: filePath,
                        blocks: sgBlocks
                    };
                }
            }
        },

        findModulesinHTML: function(html, templateMeta) {
            var $template = cheerio.load(html),
                modules = {};

            for (var folder in styles) {

                for (var file in styles[folder]) {
                    styles[folder][file].blocks.forEach(function(val, index, arr) {
                        if (val.example) {
                            var partialName = val.name;
                                $partialHTML = cheerio.load(val.example),
                                partialChildren = $partialHTML('*'),
                                partialClass = '';

                            if (partialChildren && partialChildren.length) {
                                partialClass = partialChildren.eq(0).attr('class').trim();
                                partialClass = '.' + partialClass.replace(/ /g, '.');
                            }

                            if (partialClass && $template(partialClass).length) {

                                modules[folder] = modules[folder] ? modules[folder] : [];
                                modules[folder].push(partialName);

                                if (templateMeta) {
                                    styles[folder][file].blocks[index].templates = styles[folder][file].blocks[index].templates ? styles[folder][file].blocks[index].templates : [];
                                    styles[folder][file].blocks[index].templates.push(templateMeta);
                                }
                            }

                        }
                    });
                }

            }

            return modules;
        },

        gatherTemplateJSON: function() {

            var templates = {};

            for (var index in files.templates) {
                // Loop through each of the template files
                var filePath = files.templates[index],
                    filePathBase = path.basename(filePath, '.html'),
                    filePathArray = path.dirname(filePath).split('/'),
                    fileParent = filePathArray[filePathArray.length - 1],
                    fileContent = fs.readFileSync(filePath, 'utf8'),
                    YAPLBlocks = fileContent.match(s.htmlBlockRegEx),
                    templateModules,
                    json = {};

                templates[filePathBase] = {
                    name: filePathBase.replace(/\-/g, ' '), // Use this in case no name spec'd in YAPL block
                    path: filePath,
                    pathBase: filePathBase,
                    parent: fileParent
                };

                templateModules = YAPL.findModulesinHTML(fileContent, templates[filePathBase]);

                if (YAPLBlocks && YAPLBlocks.length) {
                    var newString = YAPLBlocks[0].replace(/\<!--\s*?YAPL\n/, '');

                    newString = newString.replace('-->', '');
                    json = yaml.safeLoad(newString);
                }

                // Save module info to the master templates object
                templates[filePathBase].modules = templateModules;
                templates[filePathBase] = extend({}, templates[filePathBase], json);

            }

            styles.templates = templates;
        },

        compileHtmlExample: function(partialLink, contextLink) {
            var source,
                template,
                html,
                context = '',
                contextFile,
                contextFileRoot = contextLink ? contextLink.split('.')[0] : null,
                contextFileTip = contextLink ? contextLink.split('.')[1] : null;

            sourceFiles = glob.sync(s.partialsDir + '/**/' + partialLink + '.hbs')
            if (sourceFiles && sourceFiles.length) {
                source = fs.readFileSync(sourceFiles[0], 'utf8');
            }

            if (contextLink && s.dataDir) {

                contextFiles = glob.sync(s.dataDir + '/**/' + contextFileRoot + '.{json,yaml}');
                if (contextFiles && contextFiles.length) {
                    contextFile = fs.readFileSync(contextFiles[0], 'utf8');
                    context = yaml.safeLoad(contextFile)[contextFileTip];
                }

            }

            if (source) {
                template = handlebars.compile(source);
                html = template(context);
                html = html.replace(/^\s+|\s+$/g, '');
                html = html.replace(/\n+/g, '\n');
                return html;
            }
        },

        saveJSONFile: function() {
            fs.writeFileSync(s.outputFile, JSON.stringify(styles));
        }

    };
})();

module.exports = YAPL;

