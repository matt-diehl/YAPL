/*global $ */

// This module handles checking that a screensize condition is met

var Media = (function() {
    'use strict';

    var s;

    return {
        settings: {
            windowWidth: document.body.clientWidth,
            breakpoints: {
                small: 320,
                medium: 675,
                large: 1050,
                xlarge: 1215
            }
        },

        init: function(args) {
            s = $.extend({}, this.settings, args);
            this.bindUIActions();
        },

        bindUIActions: function() {
            // Rather than constantly calculate width, we'll set it to 0
            // if the window is resized we'll calculate again when 'meetsContext' is called.
            $(window).on('resize', function() {
                s.windowWidth = 0;
            });

        },

        getCurrentQuery: function() {
            var mq = 'mq-small';

            if (!s.windowWidth) {
                s.windowWidth = document.body.clientWidth;
            }
            if (s.windowWidth > s.breakpoints.large) {
                mq = 'mq-large';
            } else if (s.windowWidth > s.breakpoints.medium) {
                mq = 'mq-medium';
            }
            return mq;
        },

        meetsContext: function(context) {
            var meets = false,
                mq = Media.getCurrentQuery();

            for (var i = 0; i < context.length; i++) {
                if (context[i] === mq || context[i] === '') {
                    meets = true;
                }
            }

            return meets;
        }

    };

})();

Media.init();