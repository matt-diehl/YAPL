/*global $, Media*/

// Vertical responsiveness for Header

var Header = (function() {
    'use strict';

    var s;

    return {
        settings: {
            el: {
                $header: $('.js-header'),
                $primaryNav: $('.js-nav-primary'),
                $utilityNav: $('.js-nav-utility'),
                $navs: $('.js-nav-primary-inner')
            },
            fixed: true,
            threshold: null
        },

        init: function() {
            s = $.extend({}, this.settings);

            var headerHeight = s.el.$header.height(),
                highestNav = 0;

            $.each(s.el.$navs, function(i, nav) {
                var navHeight = $(nav).height();
                highestNav = navHeight > highestNav ? navHeight : highestNav;
            });

            s.threshold = headerHeight + highestNav;

            this.bindUIActions();
            this.windowChanged();
        },

        bindUIActions: function() {
            $(window).on('resize', this.windowChanged);
        },

        windowChanged: function() {
            var winWidth  = document.body.clientWidth,
                winHeight = document.body.clientHeight,
                navOffset = Header.settings.el.$primaryNav.offset().left,
                navAskew  = navOffset !== 0;

            // if the window is desktop-sized and
            // shorter than the header & primary nav's
            // heights combined, unfix the header
            if (winHeight < s.threshold && 
                Media.meetsContext(['mq-large'])) {
                Header.unfix();

                s.el.$navs.css('width', winWidth);

                // if the primary nav is not "docked" to
                // the left side of the window, nudge it
                if (navAskew) {
                    s.el.$navs.css('left', -navOffset);
                }

                Header.fixed = false;
            }
            else if (!Header.fixed) {
                Header.fix();

                s.el.$navs.css('width', '100%');

                if (navAskew) {
                    s.el.$navs.css('left', 0);
                }

                Header.fixed = true;
            }
        },

        fix: function() {
            $.each(s.el, function(i, $el) {
                $el.removeClass('is-unfixed');
            });
        },

        unfix: function() {
            $.each(s.el, function(i, $el) {
                $el.addClass('is-unfixed');
            });
        },

        shiftPrimaryNav: function(offset) {
            s.el.$navs.css('left', offset);
        }
    };
})();

Header.init();