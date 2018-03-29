'use strict';

// external libs
const fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    cheerio = require('cheerio'),
    parseScss = require('postcss-scss/lib/scss-parse');


/**
 * General use utility functions
 * @module yapl/utils
 */
const utils = module.exports = {

    /**
     * Convert a string to camel case notation.
     * @param  {String} str String to be converted.
     * @return {String}     String in camel case notation.
     */
    camelCase(str) {
        return str.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +(.)/g, function(match, group1) {
            return group1.toUpperCase();
        });
    },


    /**
     * Convert a string with spaces to "CSS case", where word boundaries are
     * described by hyphens ("-") and all characters are lower-case.
     * @param  {String} str String to be converted.
     * @return {string}     String in "CSS case".
     */
    cssCase(str) {
        return str.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
    },


    /**
     * Convert a string to title case notation.
     * @param  {String} str String to be converted.
     * @return {String}     String in title case notation.
     */
    titleCase(str) {
        let val = str.toLowerCase().replace(/[ |-](.)/g, function(match, group1) {
            return ' ' + group1.toUpperCase();
        });

        return val.charAt(0).toUpperCase() + val.slice(1);
    },


    /**
     * Convert an array of dimensions to an html img tag.
     * @param  {Array}  arr Array to be converted.
     * @return {String}     Image tag string.
     */
    placeholderImage(arr) {
        return '<img src="http://placehold.it/' + arr[0] + 'x' + arr[1] + '" width="' + arr[0] + '" height="' + arr[1] + '">';
    },


    /**
     * Convert an array of dimensions to an aspect ratio (8:5).
     * @param  {Array}  arr Array to be converted.
     * @return {String}     Aspect ratio string.
     */
    aspectRatio(arr) {
        let w = arr[0],
            h = arr[1],
            r = arr[0] && arr[1] && gcd(w, h);

        function gcd(a, b) {
            return (b === 0) ? a : gcd(b, a % b);
        }

        if (r) {
            return w/r + ':' + h/r;
        }
    },


    /**
     * Given a file path/url, return its dimensions
     * @param  {String} file  file path/url to read.
     * @return {Array}        Dimensions array.
     */
    dimensions(file) {
        let placeholderRegExMatchers = [
            /dummyimage\.com\/([0-9]+?)x([0-9]+)/g,
            /placehold\.it\/([0-9]+?)x([0-9]+)/g,
            /lorempixel\.com.*?\/([0-9]+?)\/([0-9]+)/g,
            /fillmurray\.com.*?\/([0-9]+?)\/([0-9]+)/g,
            /placebear\.com.*?\/([0-9]+?)\/([0-9]+)/g,
            /placecorgi\.com.*?\/([0-9]+?)\/([0-9]+)/g,
            /placekitten\.com.*?\/([0-9]+?)\/([0-9]+)/g,
            /placeimg\.com.*?\/([0-9]+?)\/([0-9]+)/g,
            /unsplash\.it.*?\/([0-9]+?)\/([0-9]+)/g,
        ];

        let getPlaceholderMatch = function(srcString) {
            let matches = placeholderRegExMatchers.map(function(regEx) {
                return regEx.exec(srcString);
            }).filter(function(matches) {
                return matches && matches.length;
            });

            if (matches.length) {
                return matches[0];
            }
        }

        let sizeOf = require('image-size'),
            externalImg = file.indexOf('http') === 0,
            placeholderMatch = getPlaceholderMatch(file),
            dimensions = [];

        if (externalImg) {
            if (placeholderMatch) {
                return [parseInt(placeholderMatch[1]), parseInt(placeholderMatch[2])];
            }
        } else {
            dimensions = sizeOf(file);
            return [dimensions.width, dimensions.height];
        }
    },


    /**
     * Copy a file from one location to another
     * @param  {String} srcFile  file path/url to read.
     * @param  {String} destFile  file path/url to write to.
     */
    copyFile(srcFile, destFile) {
        let BUF_LENGTH = 64 * 1024,
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
    },


    /**
     * Find all images in block of HTML and return the paths
     * @param  {String}  html       HTML to search.
     * @param  {String}  siteRoot   path to root of the site.
     * @return {Array}              Array of found image paths.
     */
    getImagePathsFromHtml(html, siteRoot) {
        let $ = cheerio.load(html),
            images = $('img'),
            imagePathArray = [];

        // ▼ jQuery/cheerio each
        images.each(function() {
            let imageSrc = $(this).attr('src') || '',
                imagePath = path.join(siteRoot, imageSrc),
                imageExt = path.extname(imagePath).toLowerCase(),
                startsWithHttp = imageSrc.indexOf('http') === 0;

            // If it starts with http, just use the src of the image
            if (startsWithHttp) {
                imagePathArray.push(imageSrc);
            } else if (imageSrc && imageExt !== '.svg' && imageSrc.indexOf('/') === 0) {
                // Don't collect SVGs as they're only used for icons/global elements
                // The image size package also sometimes throws an error on them
                // Also, only accept absolute paths, since relative paths won't work consistently
                imagePathArray.push(imagePath);
            }
        });

        return imagePathArray;
    },


    /**
     * Find all images in block of HTML and return the dimensions
     * @param  {String}  html       HTML to search.
     * @param  {String}  siteRoot   path to root of the site.
     * @return {Array}              Array of found image dimensions, filtered to not include duplicates.
     */
    getImageDimensionsFromHtml(html, siteRoot) {
        let images = utils.getImagePathsFromHtml(html, siteRoot),
            sizeIds = [];

        images = images.map(image => {
            return utils.dimensions(image);
        }).filter(image => {
            if (!image) return false;
            let sizeId = image.join('x');
            if (sizeIds.indexOf(sizeId) === -1) {
                sizeIds.push(sizeId);
                return true;
            } else {
                return false;
            }
        });

        return images;
    },


    /**
     * Given HTML and an array of selectors, return the selectors that return matches
     * @param  {String}  css        CSS to search.
     * @return {Array}              Array of found selectors.
     */
    findRelevantSelectorsInNestedCss(css) {
        let returnSelectors = [],
            postcssRoot = parseScss(css);

        let concatNestedRules = (selector, parent) => {
            let parentSelectors = parent.selectors || [''];

            return parentSelectors.map((parentSelector) => {
                let generatedSelector = (
                    (parentSelector || '') + (' ' + selector).replace(' &', '')
                ).trim()

                if (!parentSelector) return generatedSelector;

                return concatNestedRules(generatedSelector, parent.parent)
            });
        };

        postcssRoot.walkRules(rule => {
            let selectors = rule.selectors || [];
            selectors.forEach((s, index) => {
                returnSelectors.push(concatNestedRules(s, rule.parent));
            });
        });

        returnSelectors = _.flattenDeep(returnSelectors);

        return returnSelectors
            // dedupe
            .filter((val, index) => index === returnSelectors.indexOf(val))
            // remove selectors containing pseudo states/elements
            .filter((val) => val.indexOf(':') === -1)
            // remove selectors containing interpolated variables
            .filter((val) => val.indexOf('#{$') === -1)
            .sort();
    },


    /**
     * Given HTML and an array of selectors, return the selectors that return matches
     * @param  {String}  html       HTML to search.
     * @param  {Array}  selectors   Array of selectors to search for.
     * @return {Array}              Array of matching selectors.
     */
    findMatchingSelectors(html, selectors) {
        let $ = cheerio.load(html),
            $matches,
            filteredSelectors = [];

        $matches = $(selectors.join(','));

        filteredSelectors = selectors.filter(selector => {
            // ▼ jQuery/cheerio filter (not standard array filter)
            return $matches.filter(selector).length;
        });

        return filteredSelectors;
    },


    /**
     * Generate a CSS selector from a block of HTML.
     * @param  {String}  html  The HTML to use.
     * @return {String}        A CSS selector.
     */
    generateCssSelector(html) {
        let $dom, domItems, classAttr, selector;

        if (html) {
            $dom = cheerio.load(html);
            domItems = $dom('body > :first-child');
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
     * Get a base url-relative link given a full path to the website root and the link
     * @param  {String}  root   Full path to the website root.
     * @param  {String}  link   Full path to the link.
     * @return {String}         Base url-relative link (/pattern-library/link.html)
     */
    linkFromRoot(root, link) {
        let relativePath = path.relative(root, link);

        return '/' + relativePath;
    }

};
