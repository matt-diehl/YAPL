/* global $, Expand*/

var ContextBox = (function() {

    'use strict';

    var wrap = $('.js-context-box'),
        s;

    return {
        settings: {
            exit: $('.js-exit')
        },

        init: function(args) {
            if (wrap && wrap.length) {
                s = $.extend({}, this.settings, args);

                $.each(wrap, function(i, wrap) {
                    var target = $(wrap).data('expand-trigger'),
                        triggerEl = $('[data-expand-target="'+ target +'"]');

                    $(wrap).data('trigger', triggerEl);
                });

                this.shiftIndicators();
                this.bindUIActions();
            }
        },

        bindUIActions: function() {
            wrap.on('toggle', ContextBox.toggle);
            wrap.on('click', '.js-exit', ContextBox.exitClicked);
            $(window).on('resize', ContextBox.shiftIndicators);
        },

        toggle: function(e, trigger) {
            var toggled = trigger ? trigger : $(this),
                notToggled = wrap.not(toggled);

            $.each(notToggled, function(i, toggle) {
                var $toggle = $(toggle),
                    $toggleTrigger = $toggle.data('trigger');

                Expand.collapse($toggle);
                Expand.collapse(null, null, ['mq-large'], $toggleTrigger);
            });

            Expand.toggle(toggled);

            if (e) {
                e.preventDefault();
            }
        },

        exitClicked: function(e) {
            var toggleBox = $(this).closest('.js-context-box'),
                toggleTrigger = toggleBox.data('trigger');

            Expand.collapse(toggleBox);
            Expand.collapse(null, null, ['mq-large'], toggleTrigger);

            e.preventDefault();
        },

        shiftIndicators: function() {
            $.each(wrap, function(i, wrap) {
                var triggerEl = $(wrap).data('trigger'),
                    indicator = $(wrap).find('.js-indicator'),
                    triggerWidth = triggerEl.width(),
                    triggerPosition = triggerEl.position().left,
                    indicatorLeft = triggerWidth/2 + triggerPosition;

                indicator.css('left', indicatorLeft);
            });
        }
    };
})();

ContextBox.init();