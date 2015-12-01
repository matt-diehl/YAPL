'use strict';

var fs = require('fs'),
    path = require('path');

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
        externalImg = file.indexOf('http') === 0,
        placeholditRegEx = /placehold\.it\/([0-9]+?)x([0-9]+)/g,
        lorempixelRegEx = /lorempixel\.com.*?\/([0-9]+?)\/([0-9]+)/g,
        placeholditMatches = placeholditRegEx.exec(file),
        lorempixelMatches = lorempixelRegEx.exec(file),
        dimensions = [];

    if (externalImg) {
        if (placeholditMatches && placeholditMatches.length) {
            return [parseInt(placeholditMatches[1]), parseInt(placeholditMatches[2])];
        } else if (lorempixelMatches && lorempixelMatches.length) {
            return [parseInt(lorempixelMatches[1]), parseInt(lorempixelMatches[2])];
        } else {
            throw new Error('YAPL cannot obtain dimensions of external images except from placehold.it and lorempixel.com');
        }
    } else {
        dimensions = sizeOf(file);
        return [dimensions.width, dimensions.height];
    }
};


exports.curriedReadFile = function(path) {
    var _done, _error, _result;

    var callback = function(error, result) {
        _done = true,
        _error = error,
        _result = result;
    };

    fs.readFile(path, 'utf8', function(e, r) {
        callback(e, r);
    });

    // Here '_' is the function we pass to curriedReadFile
    // Where we actually do the IO stuff
    return function(_) {

        // If fs.readFile returned (_done is set), we just execute our IO code with the results
        if (_done) {
         _(_error, _result);

        // If it still hasn't return, our function that does IO stuff ('_')
        // now becomes the callback (see fs.readFile body)
        } else {
            callback = _;
        }
    };
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
};


exports.linkFromRoot = function(root, link) {
    var relativePath = path.relative(root, link);
    return '/' + relativePath;
};
