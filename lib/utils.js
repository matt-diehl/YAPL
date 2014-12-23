/*jslint node: true */

'use strict';

var fs = require('fs');

/**
 * Convert a string to camel case notation.
 * @param  {String} str String to be converted.
 * @return {String}     String in camel case notation.
 */
exports.camelCase = function(str) {
    return str.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +(.)/g, function(match, group1) {
        return group1.toUpperCase();
    });
};


/**
 * Convert a string with spaces to "CSS case", where word boundaries are
 * described by hyphens ("-") and all characters are lower-case.
 * @param  {String} str String to be converted.
 * @return {string}     String in "CSS case".
 */
exports.cssCase = function(str) {
    return str.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
};


/**
 * Convert a string to title case notation.
 * @param  {String} str String to be converted.
 * @return {String}     String in title case notation.
 */
exports.titleCase = function(str) {
    var val = str.toLowerCase().replace(/[ |-](.)/g, function(match, group1) {
        return ' ' + group1.toUpperCase();
    });
    return val.charAt(0).toUpperCase() + val.slice(1);
};


/**
 * Convert an array of dimensions to an html img tag.
 * @param  {Array}  arr Array to be converted.
 * @return {String}     Image tag string.
 */
exports.placeholderImage = function(arr) {
    return '<img src="http://placehold.it/' + arr[0] + 'x' + arr[1] + '" width="' + arr[0] + '" height="' + arr[1] + '">';
};


/**
 * Convert an array of dimensions to an aspect ratio (8:5).
 * @param  {Array}  arr Array to be converted.
 * @return {String}     Aspect ratio string.
 */
exports.aspectRatio = function(arr) {
    var w = arr[0],
        h = arr[1],
        r = arr[0] && arr[1] && gcd(w, h);

    function gcd(a, b) {
        return (b === 0) ? a : gcd(b, a % b);
    }

    if (r) {
        return w/r + ':' + h/r;
    }
};


/**
 * Given a file path/url, return its dimensions
 * @param  {String} file  file path/url to read.
 * @return {Array}        Dimensions array.
 */
exports.dimensions = function(file) {
    var sizeOf = require('image-size'),
        placeholditRegEx = /placehold\.it\/([0-9]+?)x([0-9]+)/g,
        matches = placeholditRegEx.exec(file);

    if (matches && matches.length) {
        return [parseInt(matches[1]), parseInt(matches[2])];
    } else {
        var dimensions = sizeOf(file);
        return [dimensions.width, dimensions.height];
    }

};


/**
 * Copy a file from one location to another
 * @param  {String} source  file path/url to read.
 * @param  {String} target  file path/url to write to.
 */
exports.copyFile = function(srcFile, destFile) {
    var BUF_LENGTH = 64 * 1024,
        _buff = new Buffer(BUF_LENGTH),
        fdr = fs.openSync(srcFile, 'r'),
        stat = fs.fstatSync(fdr),
        fdw = fs.openSync(destFile, 'w', stat.mode),
        bytesRead = 1,
        pos = 0;

    while (bytesRead > 0) {
        bytesRead = fs.readSync(fdr, _buff, 0, BUF_LENGTH, pos);
        fs.writeSync(fdw, _buff, 0, bytesRead);
        pos += bytesRead;
    }

    fs.closeSync(fdr);
    fs.closeSync(fdw);
}

