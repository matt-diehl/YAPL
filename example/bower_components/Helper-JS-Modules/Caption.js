/*global $ */

'use strict';

// This module finds all containers with an image and caption, and sets the appropriate width on the container
// For it to work properly, set the caption default state to display: none, but display: block when it's parent has the loaded class

var Caption = (function (args) {
    var s;

    return {
        settings: {
            wraps: $('.js-caption-wrap')
        },

        init: function() {
            s = $.extend({}, this.settings, args);
            this.formatCaptions();
        },

        formatCaptions: function() {
            s.wraps.each(function() {
                var wrap = $(this),
                    img = wrap.find('img'),
                    caption = wrap.find('.js-caption-content');
                img.on('load', function() {
                    caption[0].style.maxWidth = img.width() + 'px';
                    wrap.addClass('is-loaded');
                }).each(function(){
                    if(this.complete) {
                        $(this).trigger('load');
                    }
                });
            });
        }

    };
})();

Caption.init();