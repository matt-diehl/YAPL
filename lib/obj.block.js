'use strict';

// external libs
const fs = require('fs'),
    path = require('path'),
    cheerio = require('cheerio'),
    glob = require('globby'),
    yaml = require('js-yaml');

// internal libs
const utils = require('./utils.js');


/**
 * Object representing a block in the pattern library.
 * @module yapl/obj.block
 */
const Block = module.exports = {

    /**
     * Initialize a new block object.
     * @param  {Object} options         Options to pass to the initialization.
     * @param  {Object} globalSettings  Settings from the initialized Yapl object.
     */
    init(options, globalSettings) {
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
        this.selector = this.selector || utils.generateCssSelector(this.html);
    },


    /**
     * Test that the block object meets criteria / is not a duplicate.
     * @param  {Object}  testBlock  The block object to test.
     * @param  {Array}   blocks     Array of already-existing block objects.
     * @return {Boolean}            A boolean value indicating whether the block can be added
     */
    okToAdd(testBlock, blocks) {
        return blocks.every(block => {
            return testBlock.name !== block.name;
        });
    },


    /**
     * Get the file content for the block's partial.
     * @param  {Object}  block  The block object.
     * @return {String}         The content of the partial.
     */
    getPartialContent(block) {
        let section = block.parent.parent,
            matches;

        matches = section.partialFiles.filter(file => {
            let fileExt = path.extname(file),
                fileBasename = path.basename(file, fileExt);
            return fileBasename === block.partial;
        });

        if (matches.length) {
            return fs.readFileSync(path.resolve(matches[0]), 'utf8');
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
    compile(html, context, compiler, globalSettings) {
        let template, contextRoot, contextTip, contextJson, dataFiles, dataFile, dataFileContent;

        if (context) {
            contextRoot = context.split('.')[0];
            contextTip = context.split('.')[1];
            dataFiles = glob.sync(globalSettings.data) || [];

            dataFiles = dataFiles.filter(file => {
                let fileExt = path.extname(file),
                    fileBasename = path.basename(file, fileExt);
                return contextRoot === fileBasename;
            });

            if (dataFiles.length) {
                dataFile = dataFiles[0];
                dataFileContent = fs.readFileSync(dataFile);

                if (path.extname(dataFile).match(/\.ya*ml/)) {
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
