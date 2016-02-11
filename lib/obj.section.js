'use strict';

// external libs
var path = require('path'),
    glob = require('globby');

// internal libs
var utils = require('./utils.js');

/**
 * Object representing a section in the pattern library.
 * @module yapl/obj.section
 */
module.exports = {

    /**
     * Initialize a new section object.
     * @param  {Object} options         Options to pass to the initialization.
     * @param  {Object} globalSettings  Settings from the initialized Yapl object.
     */
    init: function(options, globalSettings) {
        this.name = this.name || 'Undefined Section';
        this.nameCamelCase = utils.camelCase(this.name);
        this.nameCssCase = utils.cssCase(this.name);
        this.cssFiles = this.css ? glob.sync(this.css) : [];
        this.partials = this.partials || globalSettings.partials;
        this.partialFiles = this.partials ? glob.sync(this.partials) : [];
        this.path = this.landingTemplate ? path.join(globalSettings.buildDir, this.nameCssCase, 'index.html') : false;
        this.link = this.path ? utils.linkFromRoot(globalSettings.siteRoot, this.path) : false;
    },


    /**
     * Test that the section object meets criteria / is not a duplicate
     * @param  {Object}  testSection  The section object to test.
     * @param  {Array}   sections     Array of already-existing section objects.
     * @return {Boolean}              A boolean value indicating whether the section can be added
     */
    okToAdd: function(testSection, sections) {
        return sections.every(function(section) {
            return testSection.name !== section.name;
        });
    }

};
