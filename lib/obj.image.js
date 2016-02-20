'use strict';

// external libs
const path = require('path');

// internal libs
const utils = require('./utils.js');


/**
 * Object representing an image (size) in the pattern library.
 * @module yapl/obj.image
 */
module.exports = {

    /**
     * Initialize a new image object.
     * @param  {Object} options  Options to pass to the initialization.
     */
    init(options) {
        this.dimensions = utils.dimensions(this.src || options.src);
        this.ratio = utils.aspectRatio(this.dimensions);
        this.width = this.dimensions[0];
        this.height = this.dimensions[1];
        this.name = this.dimensions[0] + ' x ' + this.dimensions[1] + ' - (' + this.ratio + ')';
        this.html = utils.placeholderImage(this.dimensions);
        this.parent = this.parent || options.parent;
        this.link = this.parent.link + '#' + this.id;
    },


    /**
     * Test that the image object meets criteria / is not a duplicate
     * @param  {Object}  testImage  The image object to test.
     * @param  {Array}   images     Array of already-existing image objects.
     * @return {Boolean}            A boolean value indicating whether the image can be added
     */
    okToAdd(testImage, images, settings) {
        let testDimensions = utils.dimensions(testImage.src),
            srcIsUnique,
            dimensionsAreUnique,
            meetsMinDimensions,
            extensionNotExcluded;

        srcIsUnique = images.every(function(image) {
            return testImage.src !== image.src;
        });

        dimensionsAreUnique = images.every(function(image) {
            return testDimensions[0] !== image.width && testDimensions[1] !== image.height;
        });

        meetsMinDimensions = testDimensions[0] >= settings.imageSizeMin[0] && testDimensions[1] >= settings.imageSizeMin[1];

        extensionNotExcluded = !path.extname(testImage.src).match(settings.imageExtExclude);

        return srcIsUnique && dimensionsAreUnique && meetsMinDimensions && extensionNotExcluded;
    }

};