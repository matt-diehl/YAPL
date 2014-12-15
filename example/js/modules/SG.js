/*global $ */


var SG = (function (args) {
    'use strict';

    var s;

    return {
        settings: {
            blockToggles: $('.js-sg-block__expand-toggle'),
            toggleAll: $('.js-sg-toggle-all'),
            allOpen: false
        },

        init: function() {
            s = $.extend({}, this.settings, args);
            if (s.blockToggles && s.blockToggles.length) {
                this.bindUIActions();
            }
        },

        bindUIActions: function() {
            s.blockToggles.on('click', SG.toggle);
            s.toggleAll.on('click', SG.toggleAll);
        },

        toggle: function() {
            var el = $(this),
                wrap = el.closest('.js-sg-block'),
                more = wrap.find('.js-sg-block__more');
            wrap.toggleClass('module-is-collapsed module-is-expanded');
            more.toggleClass('is-collapsed is-expanded');
        },

        toggleAll: function() {
            if (s.allOpen) {
                s.blockToggles.each(SG.collapse);
            } else {
                s.blockToggles.each(SG.expand);
            }
            s.toggleAll.toggleClass('sg-blocks-collapsed sg-blocks-expanded');
            s.allOpen = !s.allOpen;
        },

        expand: function() {
            var el = $(this),
                wrap = el.closest('.js-sg-block'),
                more = wrap.find('.js-sg-block__more');
            wrap.addClass('module-is-expanded').removeClass('module-is-collapsed');
            more.addClass('is-expanded').removeClass('is-collapsed');
        },

        collapse: function() {
            var el = $(this),
                wrap = el.closest('.js-sg-block'),
                more = wrap.find('.js-sg-block__more');
            wrap.addClass('module-is-collapsed').removeClass('module-is-expanded');
            more.addClass('is-collapsed').removeClass('is-expanded');
        }

    };
})();

SG.init();