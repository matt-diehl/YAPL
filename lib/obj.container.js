'use strict';

// Used as a general container for Yapl items (sections, modules, blocks, etc.)

/**
 * Object use as a general container for children objects in the pattern library.
 * @module yapl/obj.container
 */
module.exports = {

    /**
     * Initialize a new container object.
     * @param  {Object} childObj        Object to initiate new child items with.
     * @param  {String} label           Label to identify what new items are (section, module, etc).
     * @param  {Object} globalSettings  Settings from the initialized Yapl object.
     */
    init: function(childObj, label, globalSettings) {
        this.childObj = Object.create(childObj);
        this.label = label;
        this.items = [];
        this.count = 0;
        this.globalSettings = globalSettings;

        return this;
    },


	/**
     * Add a child item, if it passes the 'okToAdd' test
     * @param  {Object} item     Base object to add.
     * @param  {Object} options  Options to pass to the initialization.
     * @return {Object}          The added item (or false if none added).
     */
    add: function(item, options) {
        if (this.childObj.okToAdd(item, this.items, this.globalSettings)) {
            item.id = `${this.label}_${this.count}`;
            item.type = this.label;
            // childObj is called with "item" as the "this"
            // passing optional options, and the base settings
            this.childObj.init.call(item, options || {}, this.globalSettings);
            this.items.push(item);
            this.count++;

            return item;
        }
    },


    /**
     * Array forEach method, called on the container's items.
     */
    forEach: function() {
        [].forEach.apply(this.items, arguments);
    },


    /**
     * Sort the containers items alphabetically, by a particular property.
     * @param  {String} prop  Property to sort by.
     */
    sortAlpha: function(prop) {
        this.items.sort(function(a, b) {
            var aSortVal = a[prop].toLowerCase(),
                bSortVal = b[prop].toLowerCase();

            if (aSortVal < bSortVal){
                return -1;
            } else if (aSortVal > bSortVal) {
                return  1;
            } else {
                return 0;
            }
        });
    },


    /**
     * Sort the containers items numerically, by a particular property.
     * @param  {String} prop  Property to sort by.
     */
    sortNumeric: function(prop) {
        this.items.sort(function(a, b) {
            var aSortVal = a[prop],
                bSortVal = b[prop];

            if (aSortVal < bSortVal){
                return -1;
            } else if (aSortVal > bSortVal) {
                return  1;
            } else {
                return 0;
            }
        });
    },


    /**
     * Remove all items from the container.
     */
    empty: function() {
        this.items = [];
    }

};