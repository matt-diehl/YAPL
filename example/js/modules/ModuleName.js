/*global $ */

// Module boilerplate

var ModuleName = (function() {
    'use strict';

    var wrap = $('.js-modulename'),
        s;

    return {
        settings: {
            // Define default setting here
            // Passed arguments will override and merge with these defaults
            toggle: $('.js-modulename-toggle')
        },

        init: function(args) {
            // Test for the presence of the module on the page before initializing
            if (wrap && wrap.length) {
                s = $.extend({}, this.settings, args);
                this.bindUIActions();
            }
        },

        // Add event listeners
        bindUIActions: function() {
            s.toggle.on('click', ModuleName.publicMethod);
        },

        publicMethod: function() {
            // Do something
        }

    };
})();

ModuleName.init();