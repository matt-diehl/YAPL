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

    empty: function() {
        this.items = [];
    }

};