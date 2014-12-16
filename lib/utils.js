
/**
 * Convert a string to camel case notation.
 * @param  {String} str String to be converted.
 * @return {String}     String in camel case notation.
 */
exports.camelCase = function(input) {
    return input.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +(.)/g, function(match, group1) {
        return group1.toUpperCase();
    });
}


/**
 * Convert a string with spaces to "CSS case", where word boundaries are
 * described by hyphens ("-") and all characters are lower-case.
 * @param  {String} str String to be converted.
 * @return {string}     String in "CSS case".
 */
exports.cssCase = function(input) {
    return input.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
};


/**
 * Convert a string to title case notation.
 * @param  {String} str String to be converted.
 * @return {String}     String in title case notation.
 */
exports.titleCase = function(input) {
    var val = input.toLowerCase().replace(/[ |-](.)/g, function(match, group1) {
        return ' ' + group1.toUpperCase();
    });
    return val.charAt(0).toUpperCase() + val.slice(1);
};