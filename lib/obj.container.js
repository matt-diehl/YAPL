'use strict';

// Used as a general container for Yapl items (sections, modules, blocks, etc.)

module.exports = {

    init: function(constructor, label, settings) {
        this.constructor = Object.create(constructor);
        this.label = label;
        this.items = [];
        this.count = 0;
        this.settings = settings;

        return this;
    },

    add: function(item, options) {
        if (this.constructor.okToAdd(item, this.items)) {
            item.id = `${this.label}_${this.count}`;
            item.type = this.label;
            // constructor is called with "item" as the "this"
            // passing optional options, and the base settings
            this.constructor.init.call(item, options || {}, this.settings);
            this.items.push(item);
            this.count++;

            return item;
        }
    },

    forEach: function(fn) {
        [].forEach.call(this.items, fn);
    },

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

    empty: function() {
        this.items = [];
    }

};