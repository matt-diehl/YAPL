

exports.camelCase = function(input) {
    return input.toLowerCase().replace(/[ |-](.)/g, function(match, group1) {
        return group1.toUpperCase();
    });
}


exports.cssCase = function(input) {
    return input.toLowerCase().replace(/ (.)/g, function(match, group1) {
        return '-' + group1;
    });
};

exports.titleCase = function(input) {
    var val = input.toLowerCase().replace(/-(.)/g, function(match, group1) {
        return ' ' + group1.toUpperCase();
    });
    return val.charAt(0).toUpperCase() + val.slice(1);
};