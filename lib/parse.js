'use strict';

var fs = require('fs'),
    yaml = require('js-yaml');

var regEx = {
    css: /\/\*\s*?YAPL\n([\s\S]*?)\*\//g,
    html: /<!--\s*?YAPL\n([\s\S]*?)--\>/
};

var parse = module.exports = {

    init: function(options) {
        options = options || {};
        this.regEx = {};
        this.regEx.css = options.cssBlockRegEx || regEx.css;
        this.regEx.html = options.htmlBlockRegEx || regEx.html;
        return this;
    },

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

    fromHtml: function(str) {
        var regEx = this.regEx || parse.regEx,
            YAPLBlocks = str.match(regEx.html),
            YAPLJson = {};

        if (YAPLBlocks && YAPLBlocks.length) {
            YAPLBlocks.forEach(function(YAPLBlock) {
                var yamlString;

                yamlString = YAPLBlock.replace(regEx.html, function(match, p1) {
                    return p1;
                });

                YAPLJson = yaml.safeLoad(yamlString);

            });
        }

        return YAPLJson;
    },

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
