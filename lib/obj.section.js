'use strict';

// external libs
var path = require('path'),
    glob = require('globby');

// internal libs
var utils = require('./utils.js');

module.exports = {

    init: function(options, globalSettings) {
        this.name = this.name || 'Undefined Section';
        this.nameCamelCase = utils.camelCase(this.name);
        this.nameCssCase = utils.cssCase(this.name);
        this.cssFiles = this.css ? glob.sync(this.css) : [];
        this.partials = this.partials || globalSettings.partials;
        this.partialFiles = this.partials ? glob.sync(this.partials) : [];
        this.data = this.data || globalSettings.data;
        this.dataFiles = this.data ? glob.sync(this.data) : [];
        this.path = this.landingTemplate ? path.join(globalSettings.buildDir, this.nameCssCase, 'index.html') : false;
        this.link = this.path ? utils.linkFromRoot(globalSettings.siteRoot, this.path) : false;
    },

    okToAdd: function(testSection, sections) {
        return sections.every(function(section) {
            return testSection.name !== section.name;
        });
    }

};
