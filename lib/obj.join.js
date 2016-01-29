'use strict';

module.exports = {

    init: function(options, globalSettings) {
        this.parent = this.parent || options.parent;
        this.child = this.child || options.parent;
    },

    okToAdd: function(testJoin, joins) {
        return joins.every(function(join) {
            return !(testJoin.parent.id === join.parent.id && testJoin.child.id === join.child.id);
        });
    }

}