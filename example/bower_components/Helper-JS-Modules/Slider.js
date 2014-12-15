/*global $, Modernizr */

'use strict';

// This module handles basic slideshow functionality

var Slider = (function (args) {
    var s;

    return {
        settings: {
            delay: 5000,
            slider: $('.js-slider'),
            slides: $('.js-slider-slide'),
            pager: $('.js-slider-pager'),
            totalSlides: $('.js-slider-slide').length,
            interval: 0,
            status: '',
            cssTransitionSupport: Modernizr.csstransitions
        },

        init: function() {
            s = $.extend({}, this.settings, args);
            this.buildPager();
            this.chooseRandomSlide();
            this.bindUIActions();
        },

        bindUIActions: function() {
            s.slider.on('mouseenter', function() {
                if (s.status !== 'paused') {
                    Slider.stopSlider();
                }
            });
            s.slider.on('mouseleave', function() {
                if (s.status !== 'playing') {
                    Slider.playSlider();
                }
            });
            s.pagerLinks.on('click', function() {
                if (!$(this).hasClass('is-active')) {
                    var index = $(this).data('index');
                    Slider.showSlide(s.slides.eq(index), $(this));
                }
            });
            // Window load events
            $(window).load(function () {
                // Set slideshow in motion
                Slider.stopSlider(); // In case another event already set it in motion
                Slider.playSlider();
            });
        },

        buildPager: function() {
            for (var i = 0; i < s.totalSlides; i++) {
                s.pager.append('<button class="content_slider-pager-link js-slider-pager-link" data-index="' + i + '">&bull;</button>');
            }
            s.pagerLinks = s.pager.children('.js-slider-pager-link');
        },

        chooseRandomSlide: function() {
            var random = Math.floor(s.totalSlides * Math.random());
            s.slides.eq(random).addClass('is-active');
            s.pagerLinks.eq(random).addClass('is-active');
        },

        // Fallback jquery animation for browsers that don't support css transitions
        animateSlides: function(currentSlide, nextSlide) {
            s.slides.stop(true, true);
            currentSlide[0].removeAttribute('style');
            nextSlide.animate({
                left: '-=100%'
            }, 1000);
        },

        showSlide: function(nextSlide, nextPagerLink) {
            var currentSlide = s.slides.filter('.is-active'),
                currentPagerLink = s.pagerLinks.filter('.is-active');

            if (!s.cssTransitionSupport) {
                Slider.animateSlides(currentSlide, nextSlide);
            }

            currentSlide.removeClass('is-active');
            nextSlide.addClass('is-active');
            currentPagerLink.removeClass('is-active');
            nextPagerLink.addClass('is-active');

        },

        // Next slide trigger for slideshow
        showNextSlide: function () {
            var nextSlide = s.slides.filter('.is-active').next(),
                nextPagerLink = s.pagerLinks.filter('.is-active').next(),
                firstSlide = s.slides.eq(0),
                firstPagerLink = s.pagerLinks.eq(0);
            if (!nextSlide.length) {
                nextSlide = firstSlide;
                nextPagerLink = firstPagerLink;
            }

            Slider.showSlide(nextSlide, nextPagerLink);
            Slider.playSlider();

        },

        // Automatically play slideshow
        playSlider: function () {
            s.interval = window.setTimeout(Slider.showNextSlide, s.delay);
            s.status = 'playing';
        },

        // Stop automatically shifting slides
        stopSlider: function () {
            window.clearTimeout(s.interval);
            s.status = 'paused';
        }

    };
})();