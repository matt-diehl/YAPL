/*global $ */

var Table = (function() {
    'use strict';

    var tables = $('.rtf table'),
        s;

    return {
        settings: {
            tableWrap: '<div class="table--responsive"></div>'
        },

        init: function(args) {
            // Test for the presence of the module on the page before initializing
            if (tables && tables.length) {
                s = $.extend({}, this.settings, args);
                tables.wrap(s.tableWrap);
            }
        }

    };
})();

Table.init();