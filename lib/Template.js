'use strict';

// external libs
var path = require('path');

// internal libs
var utils = require('./utils.js');

module.exports = {

    init: function(options, globalSettings) {
        var fileExt = path.extname(this.file),
            fileBasename = path.basename(this.file, fileExt);

        this.name = this.name || utils.titleCase(fileBasename);
        this.nameCamelCase = utils.camelCase(this.name);
        this.nameCssCase = utils.cssCase(this.name);
        this.path = this.file;
        this.link = utils.linkFromRoot(globalSettings.siteRoot, this.file);
        this.html = utils.curriedReadFile(this.file);

        // this.html(function(err, data) {
        //     console.log(data);
        // });
    },

    okToAdd: function(testTemplate, container) {
        return container.items.every(function(template) {
            return testTemplate.name !== template.name;
        });
    }

};
