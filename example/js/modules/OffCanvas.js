/* global $ */

var OffCanvas = (function(args) {

    'use strict';

    var s;

    return {
        settings: {
            contentWrap: $('.js-content-wrap'),
            navToggle: $('.js-content-nav-toggle')
        },

        init: function() {
            s = $.extend({}, this.settings, args);
            this.bindUIActions();
        },

        bindUIActions: function() {
            s.navToggle.on('click', function(e) {
                e.preventDefault();
                OffCanvas.toggleNav();
            });
        },

        toggleNav: function() {
            s.contentWrap.toggleClass('content-nav-is-visible');
        }

    };
})();

OffCanvas.init();