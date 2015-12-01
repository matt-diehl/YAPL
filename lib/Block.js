'use strict';

// external libs
var fs = require('fs'),
    path = require('path');

// internal libs
var utils = require('./utils.js');

var Block = module.exports = {

    init: function(options, globalSettings) {
        this.name = this.name || 'Undefined Name';
        this.nameCamelCase = utils.camelCase(this.name);
        this.nameCssCase = utils.cssCase(this.name);
        this.parent = options.parent;
        this.partial = this.partial || options.parent.partial;
        this.link = options.parent.link + '#' + this.nameCssCase;
        this.html = Block.getPartialContent(this);
        this.compile = function(handlebars) {
            var template;

            if (this.html) {
                template = handlebars.compile(this.html);
                this.html = template('');
                this.html = this.html.replace(/^\s+|\s+$/g, '');
                this.html = this.html.replace(/\n+/g, '\n');
            }
        };
    },

    okToAdd: function(testBlock, container) {
        return container.items.every(function(block) {
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
