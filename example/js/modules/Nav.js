/* global $, Expand, Media */

var Nav = (function() {

    'use strict';

    var wrap = $('.js-nav-wrap'),
        s;

    return {
        settings: {
            mobileNavShowToggle: $('.js-nav-toggle'),
            subMenuToggles: wrap.find('.js-nav__level1-toggle'),
            subMenuCloseToggles: wrap.find('.js-nav__level2-close')
        },

        init: function(args) {
            // Test for the presence of the module on the page before initializing
            if (wrap && wrap.length) {
                s = $.extend({}, this.settings, args);
                this.bindUIActions();
            }
        },

        // Add event listeners
        bindUIActions: function() {
            // Click on main nav show toggle
            s.mobileNavShowToggle.on('click', Nav.toggleMobileMenu);

            // Click on top level <a> of nav-primary or nav-utility
            s.subMenuToggles.on('click', Nav.toggleSubMenuOrFollowLink);

            // Click on flyout close button
            s.subMenuCloseToggles.on('click', function() {
                Nav.toggleSubMenu();
            });

            // On click outside of nav, close the flyouts
            $('body').on('click', function(e) {
                var target = $(e.target);

                if (!target.closest('.js-nav-wrap').length && Media.meetsContext(['mq-large'])) {
                    Nav.toggleSubMenu();
                }
            });

        },

        // Display the mobile menu at the top of the page
        toggleMobileMenu: function() {
            $('body').toggleClass('is-showing-mobile-nav');
            wrap.toggleClass('is-active-mobile');
        },

        toggleSubMenuOrFollowLink: function(e) {
            var el = $(this);

            // Check if we're at mobile/tablet or that the clicked element is in the primary nav
            // If we're at desktop, and the clicked element is in the utility menu, we'll just follow it
            if (Media.meetsContext(['mq-small', 'mq-medium']) || el.closest('.js-nav-primary').length) {

                // If the menu is closed, or if the click target is the icon, toggle the expansion of the menu.
                if (!el.data('open') || e.target.className.match(/nav__level1-toggle-icon/)) {
                    e.preventDefault();
                    Nav.toggleSubMenu(el);
                }

            }

        },

        // Show the flyout/child items for a given nav item
        toggleSubMenu: function(el) {
            var collapseItem = wrap.find('.js-expand-item.is-expanded'),
                collapseWrap = collapseItem.closest('li'),
                collapseContext = [''],
                collapseToggle = collapseWrap.find('.js-nav__level1-toggle'),
                expandItem,
                expandWrap,
                expandContext,
                expandToggle;

            // Only get an item to toggle if an element was passed as an argument
            if (el && el.length) {
                expandItem = el.siblings('.js-expand-item'),
                expandWrap = expandItem.closest('li'),
                expandContext = [''],
                expandToggle = el;
            }

            Expand.collapse(collapseItem, collapseWrap, collapseContext, collapseToggle);
            // Set all collapsed items to store an open state of false
            collapseToggle.data('open', false);

            if (expandItem && collapseItem[0] !== expandItem[0]) {
                // Reverse the stored open state of any toggled item
                var openState = !expandToggle.data('open');
                Expand.toggle(expandItem, expandWrap, expandContext, expandToggle);
                expandToggle.data('open', openState);
            }
        }

    };
})();

Nav.init();