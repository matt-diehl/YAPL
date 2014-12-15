/*global $ */

var StorySlider = (function() {
    'use strict';

    var wrap = $('.js-story-slider'),
        s,
        state;

    return {
        settings: {
            // Define default setting here
            // Passed arguments will override and merge with these defaults
            slides: wrap.find('.js-story-slider__story'),
            totalSlides: 0,
            prevBtn: wrap.find('.js-story-slider__prev'),
            nextBtn: wrap.find('.js-story-slider__next')
        },

        state: {
            index: 0
        },

        init: function(args) {
            // Test for the presence of the module on the page before initializing
            if (wrap && wrap.length) {
                s = $.extend({}, this.settings, args);
                state = this.state;
                s.totalSlides = s.slides.length;
                this.bindUIActions();
            }
        },

        // Add event listeners
        bindUIActions: function() {
            s.nextBtn.on('click', function() {
                state.index = state.index < s.totalSlides - 1 ? state.index + 1 : 0;
                StorySlider.updateView();
            });
            s.prevBtn.on('click', function() {
                state.index = state.index > 0 ? state.index - 1 : s.totalSlides - 1;
                StorySlider.updateView();
            });
        },

        updateView: function() {
            wrap.attr('data-position', state.index);
        }

    };
})();

StorySlider.init();