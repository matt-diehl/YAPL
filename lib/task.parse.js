'use strict';

const fs = require('fs'),
    yaml = require('js-yaml');

const defaultRegEx = {
    css: /\/\*\s*?YAPL\n([\s\S]*?)\*\//g,
    html: /<!--\s*?YAPL\n([\s\S]*?)--\>/g
};

// TODO: can probably reduce code duplication in this

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
     * Parse Yapl comments from CSS.
     * @param  {String} str CSS to search
     * @return {Array}      Array of objects parsed from the Yapl comments.
     */
    fromCss(str) {
        let regEx = this.regEx || parse.defaultRegEx,
            yaplBlocks = str.match(regEx.css),
            yaplJson = [];

        if (yaplBlocks && yaplBlocks.length) {
            yaplBlocks.forEach(yaplBlock => {
                let yamlString,
                    json;

                yamlString = yaplBlock.replace(regEx.css, function(match, p1) {
                    return p1;
                });

                json = yaml.safeLoad(yamlString);

                yaplJson.push(json);

            });
        }

        return yaplJson;
    },


    /**
     * Parse Yapl comments from HTML.
     * @param  {String} str HTML to search.
     * @return {Array}      Array of objects parsed from the Yapl comments.
     */
    fromHtml(str) {
        let regEx = this.regEx || parse.defaultRegEx,
            yaplBlocks = str.match(regEx.html),
            yaplJson = [];

        if (yaplBlocks && yaplBlocks.length) {
            yaplBlocks.forEach(yaplBlock => {
                let yamlString,
                    json;

                yamlString = yaplBlock.replace(regEx.html, function(match, p1) {
                    return p1;
                });

                json = yaml.safeLoad(yamlString);

                yaplJson.push(json);

            });
        }

        return yaplJson;
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

        if (fileType === 'css') {
            return parse.fromCss(fileContent);
        } else if (fileType === 'html') {
            return parse.fromHtml(fileContent);
        }
    }

};
