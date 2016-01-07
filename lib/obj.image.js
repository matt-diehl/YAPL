'use strict';

// internal libs
var utils = require('./utils.js');

module.exports = {

    init: function(options, globalSettings) {
        this.dimensions = utils.dimensions(this.src);
        this.ratio = utils.aspectRatio(this.dimensions);
        this.name = this.dimensions[0] + ' x ' + this.dimensions[1] + ' - (' + this.ratio + ')';
        this.html = utils.placeholderImage(this.dimensions);
    },

    okToAdd: function(testImage, images) {
        return images.every(function(image) {
            return testImage.src !== image.src;
        });
    }

};