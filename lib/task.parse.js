'use strict';

var fs = require('fs'),
    yaml = require('js-yaml');

var regEx = {
    css: /\/\*\s*?YAPL\n([\s\S]*?)\*\//g,
    html: /<!--\s*?YAPL\n([\s\S]*?)--\>/g
};

// TODO: can probably reduce code duplication in this

/**
 * Task to parse yapl comments from CSS or HTML.
 * @module yapl/task.parse
 */
var parse = module.exports = {

    /**
     * Initialize a new parse object.
     * @param  {Object} [options]                Initialization options.
     * @param  {String} [options.cssBlockRegEx]  Regular expression to match CSS blocks.
     * @param  {String} [options.htmlBlockRegEx] Regular expression to match HTML blocks.
     * @return {Object}                          The initialized parse object.
     */
    init: function(options) {
        options = options || {};
        this.regEx = {};
        this.regEx.css = options.cssBlockRegEx || regEx.css;
        this.regEx.html = options.htmlBlockRegEx || regEx.html;
        return this;
    },


    /**
     * Parse Yapl comments from CSS.
     * @param  {String} str CSS to search
     * @return {Array}      Array of objects parsed from the Yapl comments.
     */
    fromCss: function(str) {
        var regEx = this.regEx || parse.regEx,
            YAPLBlocks = str.match(regEx.css),
            YAPLJson = [];

        if (YAPLBlocks && YAPLBlocks.length) {
            YAPLBlocks.forEach(function(YAPLBlock) {
                var yamlString,
                    json;

                yamlString = YAPLBlock.replace(regEx.css, function(match, p1) {
                    return p1;
                });

                json = yaml.safeLoad(yamlString);

                YAPLJson.push(json);

            });
        }

        return YAPLJson;
    },


    /**
     * Parse Yapl comments from HTML.
     * @param  {String} str HTML to search.
     * @return {Array}      Array of objects parsed from the Yapl comments.
     */
    fromHtml: function(str) {
        var regEx = this.regEx || parse.regEx,
            YAPLBlocks = str.match(regEx.html),
            YAPLJson = [];

        if (YAPLBlocks && YAPLBlocks.length) {
            YAPLBlocks.forEach(function(YAPLBlock) {
                var yamlString,
                    json;

                yamlString = YAPLBlock.replace(regEx.html, function(match, p1) {
                    return p1;
                });

                json = yaml.safeLoad(yamlString);

                YAPLJson.push(json);

            });
        }

        return YAPLJson;
    },


    /**
     * Parse Yapl comments from a file.
     * @param  {String} file     Path to the file.
     * @param  {String} fileType 'css' or 'html'
     * @return {Array}           Array of objects parsed from the Yapl comments.
     */
    fromFile: function(file, fileType) {
        var fileContent = fs.readFileSync(file, 'utf8');

        if (typeof fileType === 'undefined') {
            throw new Error('File type must be specified');
        }

        if (fileType === 'css') {
            return parse.fromCss(fileContent);
        } else if (fileType === 'html') {
            return parse.fromHtml(fileContent);
        }
    }

};
