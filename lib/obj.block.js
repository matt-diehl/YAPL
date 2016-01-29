'use strict';

// external libs
var fs = require('fs'),
    path = require('path'),
    cheerio = require('cheerio'),
    glob = require('globby'),
    yaml = require('js-yaml');

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
        this.context = this.context || false;
        this.link = this.parent.link + '#' + this.nameCssCase;
        this.html = options.compiler ? Block.compile(Block.getPartialContent(this), this.context, options.compiler, globalSettings) : Block.getPartialContent(this);
        this.selector = this.selector || Block.generateCssSelector(this.html);
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
    },

    generateCssSelector: function(html) {
        var $dom, domItems, classAttr, selector;

        if (html) {
            $dom = cheerio.load(html);
            domItems = $dom('*');
            classAttr = domItems.eq(0).attr('class');

            if (classAttr) {
                selector = classAttr.trim();
                selector = '.' + selector.replace(/ /g, '.');
                return selector;
            } else {
                return '';
            }
        }
    },

    compile: function(html, context, compiler, globalSettings) {
        var template, contextRoot, contextTip, contextJson, dataFiles, dataFile, dataFileContent;

        if (context) {
            contextRoot = context.split('.')[0];
            contextTip = context.split('.')[1];
            dataFiles = glob.sync(globalSettings.data) || [];

            dataFiles = dataFiles.filter(function(file) {
                var fileExt = path.extname(file),
                    fileBasename = path.basename(file, fileExt);
                return contextRoot === fileBasename;
            });

            if (dataFiles.length) {
                dataFile = dataFiles[0];
                dataFileContent = fs.readFileSync(dataFile);

                if (path.extname(dataFile) === '.yaml') {
                    contextJson = yaml.safeLoad(dataFileContent)[contextTip];
                } else if (path.extname(dataFile) === '.json') {
                    contextJson = JSON.parse(dataFileContent)[contextTip];
                }
            }
        } else {
            contextJson = {};
        }

        if (html) {
            template = compiler.compile(html);
            // build and format the example HTML
            return template(contextJson).replace(/^\s+|\s+$/g, '').replace(/\n+/g, '\n');
        }
    }

};
