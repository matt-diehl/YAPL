'use strict';

// external libs
const path = require('path');

// internal libs
const utils = require('./utils.js');


/**
 * Object representing a module in the pattern library.
 * @module yapl/obj.module
 */
module.exports = {

    /**
     * Initialize a new module object.
     * @param  {Object} options         Options to pass to the initialization.
     * @param  {Object} globalSettings  Settings from the initialized Yapl object.
     */
    init(options, globalSettings) {
        var cssFileExt = path.extname(this.cssFile),
            cssFileBasename = path.basename(this.cssFile, cssFileExt).replace('_', ''),
            childObjectFilename = cssFileBasename + '.html';

        this.name = utils.titleCase(cssFileBasename);
        this.nameCamelCase = utils.camelCase(cssFileBasename);
        this.nameCssCase = cssFileBasename;
        this.parent = options.parent;
        this.path = path.join(globalSettings.buildDir, this.parent.nameCssCase, childObjectFilename);
        this.link = utils.linkFromRoot(globalSettings.siteRoot, this.path);
        this.partial = cssFileBasename;
    },


    /**
     * Test that the module object meets criteria / is not a duplicate
     * @param  {Object}  testModule  The module object to test.
     * @param  {Array}   modules     Array of already-existing module objects.
     * @return {Boolean}             A boolean value indicating whether the module can be added
     */
    okToAdd(testModule, modules) {
        return modules.every(module => {
            return testModule.cssFile !== module.cssFile;
        });
    }

};
