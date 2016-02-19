'use strict';

const fs = require('fs'),
    yaml = require('js-yaml');

const defaultRegEx = {
    css: /\/\*\s*?YAPL\n([\s\S]*?)\*\//g,
    html: /<!--\s*?YAPL\n([\s\S]*?)--\>/g
};


/**
 * Task to parse yapl comments from CSS or HTML.
 * @module yapl/task.parse
 */
const parse = module.exports = {

    /**
     * Initialize a new parse object.
     * @param  {Object} [options]                Initialization options.
     * @param  {String} [options.cssBlockRegEx]  Regular expression to match CSS blocks.
     * @param  {String} [options.htmlBlockRegEx] Regular expression to match HTML blocks.
     * @return {Object}                          The initialized parse object.
     */
    init(options) {
        options = options || {};
        this.regEx = {};
        this.regEx.css = options.cssBlockRegEx || defaultRegEx.css;
        this.regEx.html = options.htmlBlockRegEx || defaultRegEx.html;
        return this;
    },


    /**
     * Parse Yapl comments from a specified content type (html or css).
     * @param  {String} str CSS to search
     * @return {Array}      Array of objects parsed from the Yapl comments.
     */
    fromType(str, type) {
        let regEx = this.regEx || parse.defaultRegEx,
            yaplBlocks = str.match(regEx[type]),
            yaplJson = [];

        if (yaplBlocks && yaplBlocks.length) {
            yaplBlocks.forEach(yaplBlock => {
                let yamlString,
                    json;

                yamlString = yaplBlock.replace(regEx[type], function(match, p1) {
                    return p1;
                });

                json = yaml.safeLoad(yamlString);

                yaplJson.push(json);

            });
        }

        return yaplJson;
    },


    /**
     * Parse Yapl comments from CSS.
     * @param  {String} str CSS to search
     * @return {Array}      Array of objects parsed from the Yapl comments.
     */
    fromCss(str) {
        return parse.fromType(str, 'css');
    },


    /**
     * Parse Yapl comments from HTML.
     * @param  {String} str HTML to search.
     * @return {Array}      Array of objects parsed from the Yapl comments.
     */
    fromHtml(str) {
        return parse.fromType(str, 'html');
    },


    /**
     * Parse Yapl comments from a file.
     * @param  {String} file     Path to the file.
     * @param  {String} fileType 'css' or 'html'
     * @return {Array}           Array of objects parsed from the Yapl comments.
     */
    fromFile(file, fileType) {
        let fileContent = fs.readFileSync(file, 'utf8');

        if (typeof fileType === 'undefined') {
            throw new Error('File type must be specified');
        }

        if (fileType.match(/html|css/)) {
            return parse.fromType(fileContent, fileType);
        }
    }

};
