/*global $ */

var Video = (function (args) {

    'use strict';

    var s;

    return {
        settings: {
            videos: $('object, iframe, video'),
            youtubeVids: $('iframe[src*="//www.youtube.com/embed"]')
        },

        init: function() {
            s = $.extend({}, this.settings, args);
            if (s.videos && s.videos.length) {
                this.wrapVideos();
            }
            if (s.youtubeVids.length) {
                this.fixZIndex();
            }
        },

        wrapSingleVideo: function(el) {
            var width = el.attr('width') || 640,
                height = el.attr('height') || 480,
                paddingBottom = ((height / width) * 100) + '%';
            el.wrap('<div style="max-width: 100%; width:' + width + 'px;"><div class="video-container" style="position: relative; padding-bottom:' + paddingBottom + '"></div></div>');
            el.css({
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: '100%'
            });
        },

        wrapVideos: function() {
            if (s.videos.length) {
                s.videos.each(function() {
                    Video.wrapSingleVideo($(this));
                });
            }
        },

        fixZIndex: function() {
            // Prevent z-index issues on IE due to flash
            s.youtubeVids.each(function() {
                var src = $(this).attr('src');
                if (src.indexOf('?') >= 0) {
                    $(this).attr({
                        'src' : src + '&wmode=transparent',
                        'wmode' : 'Opaque'
                    });
                } else {
                    $(this).attr({
                        'src' : src + '?wmode=transparent',
                        'wmode' : 'Opaque'
                    });
                }
            });
        }

    };
})();

Video.init();