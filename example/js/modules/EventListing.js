/*global $, Pikaday */

// Interactions for Event Landing template

var EventListing = (function() {
    'use strict';

    var wrap = $('.js-event-listing'),
        s,
        datepicker;

    return {
        settings: {
            datepickerField: $('.js-datepicker')[0],
            datepickerContainer: $('.js-filters__datepicker')[0]
        },

        init: function(args) {
            // Test for the presence of the module on the page before initializing
            if (wrap && wrap.length) {
                s = $.extend({}, this.settings, args);
                this.activateDatepickers();
                this.bindUIActions();
            }
        },

        // Add event listeners
        bindUIActions: function() {

        },

        activateDatepickers: function() {
            datepicker = new Pikaday({
                field: s.datepickerField,
                bound: false,
                container: s.datepickerContainer
            });
        }

    };
})();

EventListing.init();