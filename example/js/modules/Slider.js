/*global $ */

var Slider = (function() {
    'use strict';

    var wrap = $('.js-slider'),
        s;

    return {
        settings: {
            // Define default setting here
            // Passed arguments will override and merge with these defaults
            activeSlide: 0,
            slides: wrap.find('.js-slider__slide'),
            totalSlides: 0,
            pagerBtns: wrap.find('.js-slider__pager-btn'),
            nextBtn: wrap.find('.js-slider__next-btn'),
            randomizeFirstSlide: wrap.data('random') ? wrap.data('random') : false,
            offset: 0
        },

        init: function(args) {
            // Test for the presence of the module on the page before initializing
            if (wrap && wrap.length) {
                s = $.extend({}, this.settings, args);
                s.totalSlides = s.slides.length;
                s.randomizeFirstSlide && this.reorder();
                this.changeSlide(0);
                this.bindUIActions();
            }
        },

        // Add event listeners
        bindUIActions: function() {
            s.pagerBtns.on('click', function() {
                Slider.changeSlide($(this).index());
            });
            s.nextBtn.on('click', Slider.next);
        },

        getAdjustedIndex: function(slideNumber) {
            if (slideNumber + s.offset > s.totalSlides - 1) {
                return Math.abs(s.totalSlides - (slideNumber + s.offset));
            } else {
                return slideNumber + s.offset;
            }
        },

        // Start
        reorder: function() {
            s.offset = Math.floor(Math.random() * s.totalSlides);
        },

        changeSlide: function(slideNumber) {
            var el = s.pagerBtns.eq(slideNumber),
                index = Slider.getAdjustedIndex(slideNumber),
                activeSlide = s.slides.filter('.is-active'),
                newSlide = s.slides.eq(index),
                activePager = s.pagerBtns.filter('.is-active'),
                newPager = el;

            activeSlide.removeClass('is-active');
            newSlide.addClass('is-active');
            activePager.removeClass('is-active');
            newPager.addClass('is-active');

            s.activeSlide = slideNumber;
        },

        next: function() {
            var slideNumber = s.activeSlide + 1 < s.totalSlides ? s.activeSlide + 1 : 0;

            Slider.changeSlide(slideNumber);
        }

    };
})();

Slider.init();
