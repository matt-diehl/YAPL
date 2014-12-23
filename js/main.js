/*global $ */


var Yapl = (function (args) {
    'use strict';

    var s;

    return {
        settings: {
            blockToggles: $('.js-sg-block__expand-toggle'),
            blockToggleAll: $('.js-sg-toggle-all'),
            allOpen: false
        },

        init: function() {
            s = $.extend({}, this.settings, args);
            if (s.blockToggles && s.blockToggles.length) {
                this.bindUIActions();
            }
        },

        bindUIActions: function() {
            s.blockToggles.on('click', Yapl.toggleBlock);
            s.blockToggleAll.on('click', Yapl.toggleAllBlocks);
        },

        toggleBlock: function() {
            var el = $(this),
                wrap = el.closest('.js-sg-block'),
                more = wrap.find('.js-sg-block__more');
            wrap.toggleClass('module-is-collapsed module-is-expanded');
            more.toggleClass('is-collapsed is-expanded');
        },

        toggleAllBlocks: function() {
            if (s.allOpen) {
                s.blockToggles.each(Yapl.collapseBlock);
            } else {
                s.blockToggles.each(Yapl.expandBlock);
            }
            s.toggleAll.toggleClass('sg-blocks-collapsed sg-blocks-expanded');
            s.allOpen = !s.allOpen;
        },

        expandBlock: function() {
            var el = $(this),
                wrap = el.closest('.js-sg-block'),
                more = wrap.find('.js-sg-block__more');
            wrap.addClass('module-is-expanded').removeClass('module-is-collapsed');
            more.addClass('is-expanded').removeClass('is-collapsed');
        },

        collapseBlock: function() {
            var el = $(this),
                wrap = el.closest('.js-sg-block'),
                more = wrap.find('.js-sg-block__more');
            wrap.addClass('module-is-collapsed').removeClass('module-is-expanded');
            more.addClass('is-collapsed').removeClass('is-expanded');
        }

    };
})();

Yapl.init();