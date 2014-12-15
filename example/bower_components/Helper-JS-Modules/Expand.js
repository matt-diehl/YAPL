/*global $, Media, Modernizr */

'use strict';

var Expand = (function (args) {
    var s;

    return {
        settings: {
            expandToggle: $('.js-expand-toggle'), // Standard expand/collapse toggle
            expandOnlyToggle: $('.js-expand-only-toggle'), // Only expand, do not collapse
            externalTrigger: $('.js-external-trigger'), // Trigger another toggle
            expandRate: 3/5, // pixels/ms
            isTouch: Modernizr.touch,
            cssTransition: null
        },

        init: function() {
            s = $.extend({}, this.settings, args);
            this.bindUIActions();
            this.getSupportedProps();
        },

        // If the expand functionality only applies to one or two media queries, the data-expand-context attribute
        // is added to the expand toggle. The value should be the media query it applies to (mq-small)
        // Multiple contexts are handled by separating values with vertical bar characters (mq-small|mq-medium)
        bindUIActions: function() {
            s.expandToggle.on('click', function(e) {
                Expand.triggerActions($(this), e);
            });
            s.expandOnlyToggle.on('click', function(e) {
                e.preventDefault();
                if (!$(this).closest('.js-expand-wrap').hasClass('module-is-expanded')) {
                    Expand.triggerActions($(this), e);
                }
            });
            s.externalTrigger.on('click', function(e) {
                var item = $($(this).data('trigger'));
                e.preventDefault();
                item.trigger('click');
            });
        },

        getSupportedProp: function(proparray) {
            var root = document.documentElement;
            for (var i = 0; i < proparray.length; i++){
                if (typeof root.style[proparray[i]] === 'string'){
                    return proparray[i];
                }
            }
        },

        getSupportedProps: function() {
            s.cssTransition = this.getSupportedProp(['transition', 'MozTransition', 'WebkitTransition', 'msTransition', 'OTransition']);
        },

        triggerActions: function(el, e) {
            var dataExpandItem = el.data('expand-item'),
                dataCollapseItem = el.data('collapse'),
                expandWrap = el.closest('.js-expand-wrap'),
                expandItem = dataExpandItem ? $(dataExpandItem) : expandWrap.children('.js-expand-item'),
                collapseItem = dataCollapseItem ? $(dataCollapseItem) : null,
                context = el.data('expand-context') ? el.data('expand-context').split('|') : [''];
            e.stopPropagation();
            if (Media.meetsContext(context)) {
                e.preventDefault();
                if (collapseItem && collapseItem.length && collapseItem[0] !== expandItem[0]) {
                    Expand.collapse(collapseItem, collapseItem.closest('.js-expand-wrap'), context);
                }
                if (expandItem) {
                    Expand.toggle(expandItem, expandWrap, context);
                }
            }
        },

        getClasses: function(context) {
            var classes = ['', '', '', ''];
            if (!context) {
                context = [''];
            }
            for (var i = 0; i < context.length; i++) {
                var suffix = context[i].length ? '-' + context[i] : '';
                classes[0] += ' is-expanded' + suffix;
                classes[1] += ' is-collapsed' + suffix;
                classes[2] += ' module-is-expanded' + suffix;
                classes[3] += ' module-is-collapsed' + suffix;
            }
            return classes;
        },

        getTransitionVal: function(height) {
            var transitionTime = height / s.expandRate,
                transitionVal = 'max-height ' + transitionTime + 'ms linear, margin ' + transitionTime + 'ms linear, padding ' + transitionTime + 'ms linear';
            return transitionVal;
        },

        toggle: function(item, wrap, context) {

            if (item[0].className.match(/is-collapsed/)) {
                Expand.expand(item, wrap, context);
            } else if (item[0].className.match(/is-expanded/)) {
                Expand.collapse(item, wrap, context);
            }

        },

        expand: function(item, wrap, context) {

            var classes = Expand.getClasses(context),
                expandHeight = item[0].scrollHeight,
                transitionVal = Expand.getTransitionVal(expandHeight);

            if (item.length) {
                if (s.cssTransition && !s.isTouch) {
                    item[0].style[s.cssTransition] = transitionVal;
                    item[0].style.overflow = 'hidden';
                    window.setTimeout(function() {
                        item[0].style.maxHeight = expandHeight + 'px';
                        item.removeClass(classes[1]).addClass(classes[0]);
                        item.on('transitionend', function() {
                            item.off('transitionend');
                            item[0].removeAttribute('style');
                        });
                    }, 50);
                } else { // If no transition support, just change classes
                    item.removeClass(classes[1]).addClass(classes[0]);
                }
            }
            if (wrap.length) {
                wrap.addClass(classes[2]).removeClass(classes[3]);
            }

        },

        collapse: function(item, wrap, context) {

            var classes = Expand.getClasses(context),
                expandHeight = item[0].scrollHeight,
                transitionVal = Expand.getTransitionVal(expandHeight);

            if (item.length) {
                if (s.cssTransition && !s.isTouch) {
                    item[0].style.maxHeight = expandHeight + 'px';
                    item.removeClass(classes[0]);
                    item[0].style[s.cssTransition] = transitionVal;
                    item[0].style.overflow = 'hidden';
                    window.setTimeout(function() {
                        item[0].style.maxHeight = '0px';
                        item.on('transitionend', function() {
                            item.addClass(classes[1]);
                            item[0].removeAttribute('style');
                            item.off('transitionend');
                        });
                    }, 50);
                } else {
                    item.removeClass(classes[0]).addClass(classes[1]);
                }
            }
            if (wrap.length) {
                wrap.removeClass(classes[2]).addClass(classes[3]);
            }

        }

    };

})();

Expand.init();