/* global $, window, Media */

var Hero = (function(args) {

    'use strict';

    var wrap = $('.js-hero'),
        s;

    return {
        settings: {
            imgsSm: wrap.data('images-sm').split('|'),
            imgsMed: wrap.data('images-med').split('|'),
            imgsLg: wrap.data('images-lg').split('|'),
            imgSmLoaded: false,
            imgMedLoaded: false,
            imgLgLoaded: false,
            imgSmHtml: wrap.find('.js-hero__bg--sm'),
            imgMedHtml: wrap.find('.js-hero__bg--med'),
            imgLgHtml: wrap.find('.js-hero__bg--lg'),
            imgIndex: 0,
            resizeTimeout: 0
        },

        init: function() {
            s = $.extend({}, this.settings, args);
            s.imgIndex = Math.floor(Math.random() * s.imgsLg.length); // A random index to choose the image set
            this.loadImages();
            this.bindUIActions();
        },

        bindUIActions: function() {
            $(window).on('resize', function() {
                window.clearTimeout(s.resizeTimeout);
                s.resizeTimeout = window.setTimeout(function() {
                    Hero.loadImages();
                }, 500);

            });
        },

        loadImages: function() {
            if (!s.imgSmLoaded || !s.imgMedLoaded || !s.imgLgLoaded) {

                var img = new Image();

                if (!s.imgSmLoaded && Media.meetsContext(['mq-small'])) {
                    // Load small image
                    img.src = s.imgsSm[s.imgIndex];
                    s.imgSmHtml[0].style.backgroundImage = 'url(' + s.imgsSm[s.imgIndex] + ')';
                    s.imgSmLoaded = true;
                } else if (!s.imgMedLoaded && Media.meetsContext(['mq-medium'])) {
                    // Load medium image
                    img.src = s.imgsMed[s.imgIndex];
                    s.imgMedHtml[0].style.backgroundImage = 'url(' + s.imgsMed[s.imgIndex] + ')';
                    s.imgMedLoaded = true;
                } else if (!s.imgLgLoaded && Media.meetsContext(['mq-large'])) {
                    // Load large image
                    img.src = s.imgsLg[s.imgIndex];
                    s.imgLgHtml[0].style.backgroundImage = 'url(' + s.imgsLg[s.imgIndex] + ')';
                    s.imgLgLoaded = true;
                }

                img.onload = function() {
                    wrap.addClass('is-loaded');
                };

            }
        }

    };
})();

Hero.init();