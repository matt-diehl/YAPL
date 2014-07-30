
/*
 * Pattern Guide
 *
 */


// Requires
var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    handlebars = require('handlebars'),
    helpers = require('handlebars-helpers'),
    yaml = require('js-yaml');

// register built-in helpers
if(helpers && helpers.register) {
  helpers.register(handlebars, {}, {});
}

// Create settings - future task will be to have them set via grunt task

// RegEx to find YAML blocks in css/scss files
var sgBlockRegEx = /\/\*\s*?SG\n([\s\S]*?)\*\//g;

// styles object will be the base for all the data collected by parsing the css files
var styles = {},
    settings = {
        scssFiles: 'example/css/**/*.scss',
        partialsDir: 'example/templates-main/partials',
        dataDir: 'example/templates-main/data'
    };

// Get all style blocks from Sass files

// Convert style blocks to JSON

// Compile the HTML example for a style block
var compileHtmlExample = function(partialLink, contextLink) {

    var source,
        template,
        html,
        context = '',
        contextFile,
        contextFileRoot = contextLink ? contextLink.split('.')[0] : null,
        contextFileTip = contextLink ? contextLink.split('.')[1] : null;

    sourceFiles = glob.sync(settings.partialsDir + '/**/' + partialLink + '.hbs')
    if (sourceFiles && sourceFiles.length) {
        source = fs.readFileSync(sourceFiles[0], 'utf8');
    }

    if (contextLink) {

        contextFiles = glob.sync(settings.dataDir + '/**/' + contextFileRoot + '.{json,yaml}');
        if (contextFiles && contextFiles.length) {
            contextFile = fs.readFileSync(contextFiles[0], 'utf8');
            context = yaml.safeLoad(contextFile)[contextFileTip];
        }

    }

    if (source) {
        template = handlebars.compile(source);
        html = template(context);
        return html;
    }

};


glob(settings.scssFiles, function (err, files) {
    if (err) {
        throw err;
    }
    for (var index in files) {
        var filePath = files[index],
            filePathBase = path.basename(filePath, '.scss').replace('_', ''),
            filePathDir = path.dirname(filePath),
            filePathArray = filePathDir.split(path.sep),
            fileParent = filePathArray[filePathArray.length - 1],
            fileContent = fs.readFileSync(filePath, 'utf8'),
            matches = fileContent.match(sgBlockRegEx),
            sgBlocks = [];

        if (matches && matches.length) {
            matches.forEach(function(val) {
                var newString = val.replace(/\/\*\s*?SG\n/, ''),
                    json;
                newString = newString.replace('*/', '');
                json = yaml.safeLoad(newString);

                if (json.partial) {
                    json.example = compileHtmlExample(json.partial, json.context);
                }

                sgBlocks.push(json);
            });
            styles[fileParent] = styles[fileParent] ? styles[fileParent] : {};
            styles[fileParent][filePathBase] = sgBlocks;
        }
    }

    //console.log(styles);

    fs.writeFile('example/styleguide.json', JSON.stringify(styles), function(err) {
        if (err) {
            throw err;
        }
        console.log('File saved');
    });
});
