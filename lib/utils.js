

exports.camelCase = function(input) {
    return input.toLowerCase().replace(/ (.)/g, function(match, group1) {
        return group1.toUpperCase();
    });
}


exports.cssCase = function(input) {
    return input.toLowerCase().replace(/ (.)/g, function(match, group1) {
        return '-' + group1;
    });
};