/*global $, Media, Expand */

'use strict';

var Nav = (function (args) {
    var s;

    return {
        settings: {
            primaryNavLevel2: $('.nav-primary-level2'),
            primaryNavToggles: $('.nav-primary-level1 > li > .js-expand-toggle'),
            printToggle: $('.js-print'),
            open: false
        },

        init: function() {
            s = $.extend({}, this.settings, args);
            this.bindUIActions();
        },

        bindUIActions: function() {
            $('body').on('click', function() {
                var item = $('.nav-primary-level2.is-expanded, .nav-secondary-level2.is-expanded'),
                    wrap = item.closest('li');
                Expand.collapse(item, wrap);
                s.open = false;
                s.primaryNavToggles.data('open', false);
            });

            s.primaryNavToggles.on('click', function() {
                Nav.setNavState($(this));
            });

            s.primaryNavToggles.on('mouseenter', function(e) {
                if (Media.meetsContext(['mq-medium', 'mq-large'])) {
                    var el = $(this);
                    if (s.open && !el.data('open')) {
                        Expand.triggerActions(el, e);
                        Nav.setNavState(el);
                    }
                }
            });

            s.printToggle.on('click', function() {
                window.print();
            });
        },

        setNavState: function(el) {
            if (el.data('open')) {
                s.open = false;
                el.data('open', false);
            } else {
                s.open = true;
                s.primaryNavToggles.data('open', false);
                el.data('open', true);
            }
        }

    };

})();