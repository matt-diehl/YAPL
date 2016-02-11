'use strict';

// external libs
var fs = require('fs'),
    path = require('path'),
    cheerio = require('cheerio'),
    glob = require('globby'),
    yaml = require('js-yaml');

// internal libs
var utils = require('./utils.js');


/**
 * Object representing a block in the pattern library.
 * @module yapl/obj.block
 */
var Block = module.exports = {

    /**
     * Initialize a new block object.
     * @param  {Object} options         Options to pass to the initialization.
     * @param  {Object} globalSettings  Settings from the initialized Yapl object.
     */
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


    /**
     * Test that the block object meets criteria / is not a duplicate.
     * @param  {Object}  testBlock  The block object to test.
     * @param  {Array}   blocks     Array of already-existing block objects.
     * @return {Boolean}            A boolean value indicating whether the block can be added
     */
    okToAdd: function(testBlock, blocks) {
        return blocks.every(function(block) {
            return testBlock.name !== block.name;
        });
    },


    /**
     * Get the file content for the block's partial.
     * @param  {Object}  block  The block object.
     * @return {String}         The content of the partial.
     */
    getPartialContent: function(block) {
        var section = block.parent.parent,
            matches;

        matches = section.partialFiles.filter(function(val) {
            return val.indexOf(`${block.partial}.`) > -1;
        });

        if (matches.length) {
            return fs.readFileSync(path.resolve(matches[0]), 'utf8');
        }
    },


    /**
     * Generate a CSS selector from a block of HTML.
     * @param  {String}  html  The HTML to use.
     * @return {String}        A CSS selector.
     */
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


    /**
     * Compile a block's partial/template
     * @param  {String}  html           The template content.
     * @param  {Object}  context        Any data to pass to the template/compiler.
     * @param  {Object}  compiler       The compiler to compile with.
     * @param  {Object}  globalSettings Settings from the initialized Yapl object.
     * @return {String}         The content of the partial.
     */
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

        if (html && compiler) {
            template = compiler.compile(html);
            // build and format the example HTML
            return template(contextJson).replace(/^\s+|\s+$/g, '').replace(/\n+/g, '\n');
        }
    }

};
