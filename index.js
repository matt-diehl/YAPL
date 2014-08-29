
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
    extend = require('node.extend');

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
        // - dataDir (optional)
        settings: {
            sgBlockRegEx: /\/\*\s*?SG\n([\s\S]*?)\*\//g,
            outputFile: false
        },

        init: function(options) {
            s = extend({}, this.settings, options);

            // Only continue if a css directory was spec'd
            if (s.cssDir) {
                this.getFiles();
                this.gatherJSON();
                s.outputFile && this.saveJSONFile();
                return styles;
            } else {
                console.log('No CSS directory was specified');
            }
        },

        getFiles: function() {
            files.css = glob.sync(s.cssDir + '/**/*.{css,scss}');
        },

        gatherJSON: function() {
            // Loop through each of the css files
            for (var index in files.css) {
                var filePath = files.css[index],
                    filePathBase = path.basename(filePath, '.scss').replace('_', ''),
                    filePathArray = path.dirname(filePath).split('/'),
                    fileParent = filePathArray[filePathArray.length - 1],
                    fileContent = fs.readFileSync(filePath, 'utf8'),
                    matches = fileContent.match(s.sgBlockRegEx),
                    sgBlocks = [];

                if (matches && matches.length) {
                    matches.forEach(function(val) {
                        var newString = val.replace(/\/\*\s*?SG\n/, ''),
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

                    // Create an object for the current module if one doesn;t already exist
                    styles[fileParent] = styles[fileParent] ? styles[fileParent] : {};

                    // Save module info and array of blocks to the master styles object
                    styles[fileParent][filePathBase] = {
                        name: filePathBase,
                        parent: fileParent,
                        blocks: sgBlocks
                    };
                }
            }
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

