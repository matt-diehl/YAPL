/*global $ */

var Select = (function() {
    'use strict';

    var s;

    return {
        settings: {
            basics: $('.form select'),
            follows: $('select.js-select--follow')
        },

        init: function(args) {
            s = $.extend({}, this.settings, args);
            this.bindUIActions();
            s.basics.wrap('<div class="select-wrap" />');
        },

        // Add event listeners
        bindUIActions: function() {
            s.follows.on('change', Select.followLink);
        },

        followLink: function() {
            var url = $(this).val();

            if (url && url !== '') {
                window.location = url;
            }
        }

    };
})();

Select.init();