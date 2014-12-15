/* global $, Media */

var Expand = (function () {

    'use strict';

    var s;

    return {
        settings: {
            expandToggle: $('.js-expand-toggle'),
            expandAllToggle: $('.js-expand-all-toggle'),
            externalTrigger: $('.js-external-trigger'), // Trigger another toggle
            expandOnReady: $('[data-expand-on-ready]')
        },

        init: function(args) {
            s = $.extend({}, this.settings, args);
            this.attachData();
            this.bindUIActions();
            s.expandOnReady.length && this.triggerConditionalExpands();
        },

        // If the expand functionality only applies to one or two media queries, the data-expand-context attribute
        // is added to the expand toggle. The value should be the media query it applies to (mq-small)
        // Multiple contexts are handled by separating values with vertical bar characters (mq-small|mq-medium)
        bindUIActions: function() {
            s.expandToggle.on('click', function(e) {
                Expand.triggerActions($(this), e);
            });
            s.expandAllToggle.on('click', Expand.toggleAll);
            s.externalTrigger.on('click', function(e) {
                var item = $($(this).data('trigger'));
                e.preventDefault();
                item.trigger('click');
            });
        },

        attachData: function() {
            s.expandAllToggle.each(function() {
                var el = $(this),
                    wrap = el.closest('.js-expand-all-wrap'),
                    childToggles = wrap.find('.js-expand-toggle');
                el.data('wrap', wrap);
                el.data('childToggles', childToggles);
                el.data('open', false);
            });
        },

        triggerActions: function(el, e) {
            var dataExpandItem = el.data('expand-item'),
                dataCollapseItem = el.data('collapse'),
                dataTarget = el.data('expand-target'),
                expandWrap = el.closest('.js-expand-wrap'),
                expandItem = dataExpandItem ? $(dataExpandItem) : expandWrap.find('.js-expand-item'),
                collapseItem = dataCollapseItem ? $(dataCollapseItem) : null,
                targetItem = dataTarget ? $('[data-expand-trigger="'+ dataTarget +'"]') : null,
                context = el.data('expand-context') ? el.data('expand-context').split('|') : [''];
            e && e.stopPropagation();
            if (Media.meetsContext(context)) {
                e && e.preventDefault();
                if (collapseItem && collapseItem.length && collapseItem[0] !== expandItem[0]) {
                    Expand.collapse(collapseItem, collapseItem.closest('.js-expand-wrap'), context, el);
                
                }
                if (expandItem) {
                    Expand.toggle(expandItem, expandWrap, context, el);
                }

                if (targetItem) {
                    targetItem.trigger({
                        type: 'toggle',
                        triggerEl: el
                    });
                }
            }
        },

        triggerConditionalExpands: function() {
            s.expandOnReady.each(function() {
                var el = $(this),
                    context = el.data('expand-on-ready').split('|');
                if (Media.meetsContext(context)) {
                    Expand.triggerActions(el);
                }
            });
        },

        toggleAll: function() {
            var el = $(this),
                open = el.data('open');

            el.data('childToggles').each(function() {
                var childToggle = $(this),
                    childWrap = childToggle.closest('.js-expand-wrap'),
                    childItem = childWrap.find('.js-expand-item');

                if (open) {
                    Expand.collapse(childItem, childWrap, [''], childToggle);
                } else {
                    Expand.expand(childItem, childWrap, [''], childToggle);
                }
            });

            el.toggleClass('is-all-collapsed is-all-expanded');

            el.data('open', !open);
        },

        toggle: function(item, wrap, context, toggle) {

            if (!context) {
                context = [''];
            }

            for (var i = 0; i < context.length; i++) {

                var suffix = context[i].length ? '-' + context[i] : '';

                if (item) {
                    item.toggleClass('is-expanded' + suffix).toggleClass('is-collapsed' + suffix);
                }
                if (wrap) {
                    wrap.toggleClass('module-is-expanded' + suffix).toggleClass('module-is-collapsed' + suffix);
                }
                if (toggle) {
                    toggle.toggleClass('is-toggled' + suffix);
                }

            }

        },

        expand: function(item, wrap, context, toggle) {

            if (!context) {
                context = [''];
            }

            for (var i = 0; i < context.length; i++) {

                var suffix = context[i].length ? '-' + context[i] : '';

                if (item) {
                    item.addClass('is-expanded' + suffix).removeClass('is-collapsed' + suffix);
                }
                if (wrap) {
                    wrap.addClass('module-is-expanded' + suffix).removeClass('module-is-collapsed' + suffix);
                }
                if (toggle) {
                    toggle.addClass('is-toggled' + suffix);
                }

            }

        },

        collapse: function(item, wrap, context, toggle) {

            if (!context) {
                context = [''];
            }

            for (var i = 0; i < context.length; i++) {

                var suffix = context[i].length ? '-' + context[i] : '';

                if (item) {
                    item.removeClass('is-expanded' + suffix).addClass('is-collapsed' + suffix);
                }
                if (wrap) {
                    wrap.removeClass('module-is-expanded' + suffix).addClass('module-is-collapsed' + suffix);
                }
                if (toggle) {
                    toggle.removeClass('is-toggled' + suffix);
                }

            }

        },

    };

})();

Expand.init();