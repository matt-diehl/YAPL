'use strict';

var fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    handlebars = require('handlebars'),
    helpers = require('handlebars-helpers'),
    layouts = require('handlebars-layouts'),
    utils = require('./utils.js');


var build = module.exports = {

    init: function(settings) {
        console.log('settings');
        this.setupHandlebarsConfig();
    },

    setupHandlebarsConfig: function() {

    },

    build: function() {
        console.log('build');
    },

    createBuildDir: function() {

    },

    buildIndex: function() {

    },

    buildSections: function() {

    },

    buildModules: function() {

    }

}