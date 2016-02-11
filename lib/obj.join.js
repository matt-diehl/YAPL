'use strict';


/**
 * Object representing a join (relationship between two items) in the pattern library.
 * @module yapl/obj.join
 */
module.exports = {

    /**
     * Initialize a new join object.
     * @param  {Object} options         Options to pass to the initialization.
     * @param  {Object} globalSettings  Settings from the initialized Yapl object.
     */
    init: function(options) {
        this.parent = this.parent || options.parent;
        this.child = this.child || options.parent;
    },


    /**
     * Test that the join object meets criteria / is not a duplicate
     * @param  {Object}  testJoin  The join object to test.
     * @param  {Array}   joins     Array of already-existing join objects.
     * @return {Boolean}           A boolean value indicating whether the join can be added
     */
    okToAdd: function(testJoin, joins) {
        return joins.every(function(join) {
            return !(testJoin.parent.id === join.parent.id && testJoin.child.id === join.child.id);
        });
    }

};