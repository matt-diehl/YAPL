'use strict';

// external libs
const fs = require('fs'),
    path = require('path');

// internal libs
const utils = require('./utils.js');

/**
 * Object representing a template in the pattern library.
 * @module yapl/obj.template
 */
module.exports = {

    /**
     * Initialize a new template object.
     * @param  {Object} options         Options to pass to the initialization.
     * @param  {Object} globalSettings  Settings from the initialized Yapl object.
     */
    init(options, globalSettings) {
        let fileExt = path.extname(this.file),
            fileBasename = path.basename(this.file, fileExt);

        this.name = this.name || utils.titleCase(fileBasename);
        this.nameCamelCase = utils.camelCase(this.name);
        this.nameCssCase = utils.cssCase(this.name);
        this.path = this.file;
        this.link = utils.linkFromRoot(globalSettings.siteRoot, this.file);
        this.html = fs.readFileSync(this.file, 'utf8');
    },


    /**
     * Test that the template object meets criteria / is not a duplicate
     * @param  {Object}  testTemplate  The template object to test.
     * @param  {Array}   templates     Array of already-existing template objects.
     * @return {Boolean}               A boolean value indicating whether the template can be added
     */
    okToAdd(testTemplate, templates) {
        return templates.every(template => {
            return testTemplate.name !== template.name;
        });
    }

};
