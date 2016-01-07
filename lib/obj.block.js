'use strict';

// external libs
var fs = require('fs'),
    path = require('path');

// internal libs
var utils = require('./utils.js');

var Block = module.exports = {

    init: function(options, globalSettings) {
        options = options || {};
        globalSettings = globalSettings || {};

        this.name = this.name || options.name || 'Undefined Name';
        this.nameCamelCase = utils.camelCase(this.name);
        this.nameCssCase = utils.cssCase(this.name);
        this.parent = options.parent || {};
        this.partial = this.partial || this.parent.partial;
        this.link = this.parent.link + '#' + this.nameCssCase;
        this.html = Block.getPartialContent(this);
        this.compile = function(handlebars) {
            var template;

            if (this.html) {
                template = handlebars.compile(this.html);
                this.html = template('');
                // TODO: document what this does and consider moving it to utils.js
                this.html = this.html.replace(/^\s+|\s+$/g, '');
                this.html = this.html.replace(/\n+/g, '\n');
            }
        };
    },

    okToAdd: function(testBlock, blocks) {
        return blocks.every(function(block) {
            return testBlock.name !== block.name;
        });
    },

    getPartialContent: function(block) {
        var section = block.parent.parent,
            matches;

        matches = section.partialFiles.filter(function(val) {
            return val.indexOf(block.partial) > -1;
        });

        if (matches.length) {
            return fs.readFileSync(path.resolve(matches[0]), 'utf8');
        }
    }

};
