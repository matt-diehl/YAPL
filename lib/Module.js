'use strict';

// external libs
var path = require('path');

// internal libs
var utils = require('./utils.js');

module.exports = {

    init: function(options, globalSettings) {
        var cssFileExt = path.extname(this.cssFile),
            cssFileBasename = path.basename(this.cssFile, cssFileExt).replace('_', ''),
            childObjectFilename = cssFileBasename + '.html';

        this.name = utils.titleCase(cssFileBasename);
        this.nameCamelCase = utils.camelCase(cssFileBasename);
        this.nameCssCase = cssFileBasename;
        this.parent = options.parent;
        this.path = path.join(globalSettings.buildDir, options.parent.nameCssCase, childObjectFilename);
        this.link = utils.linkFromRoot(globalSettings.siteRoot, this.path);
        this.partial = cssFileBasename;
    },

    okToAdd: function(testModule, container) {
        return container.items.every(function(module) {
            return testModule.cssFile !== module.cssFile;
        });
    }

};
