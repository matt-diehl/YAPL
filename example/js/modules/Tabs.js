/* global $, window, Media */

var Tabs = (function(args) {

    'use strict';

    var s,
        mainTabWrap = $('.js-tabs'), // Main tabs append a hash to the url and there can only be main tab area per page
        secondaryTabWrap = $('.js-tabs--secondary'); // Secondary tabs do not append a hash - can be unlimited amount per page

    return {
        settings: {
            mainToggles: mainTabWrap.find('.js-tabs__toggle'),
            mainContentBlocks: mainTabWrap.find('.js-tabs__content'),
            mainActiveTab: 0,
            secondaryToggles: secondaryTabWrap.find('.js-tabs__toggle')
        },

        init: function() {
            if (mainTabWrap.length || secondaryTabWrap.length) {
                s = $.extend({}, this.settings, args);
                this.bindUIActions();
            }
            if (mainTabWrap.length) {
                this.activateMainTab(false);
            }
        },

        bindUIActions: function() {
            $(window).on('hashchange', function() {
                Tabs.activateMainTab(true);
            });
            s.secondaryToggles.on('click', function(e) {
                e.preventDefault();
                Tabs.activateSecondaryTab($(this));
            });
        },

        toggleMain: function(tabNumber, hashchange) {
            s.mainToggles.removeClass('is-active');
            s.mainToggles.filter('[href="#tab-' + tabNumber + '"]').addClass('is-active');
            s.mainContentBlocks.removeClass('is-active');
            s.mainContentBlocks.filter('[data-tab="' + tabNumber + '"]').addClass('is-active');
            s.mainActiveTab = tabNumber;

            if (hashchange && Media.meetsContext(['mq-small'])) {
                var tabOffsetTop = s.mainContentBlocks.eq(s.mainActiveTab - 1).offset().top;
                window.scrollTo(0, tabOffsetTop);
            }
        },

        activateMainTab: function(hashchange) {
            var activeTabNumber = s.mainContentBlocks.eq(0).data('tab') || 1,
                hash = window.location.hash;
            if (hash && hash.match(/tab-[1-9]+/)) {
                activeTabNumber = hash.split('-')[1];
                $(window).on('load', function() {
                    var tabOffsetTop = s.mainContentBlocks.eq(activeTabNumber - 1).offset().top;
                    window.scrollTo(0, tabOffsetTop);
                });
                Tabs.toggleMain(activeTabNumber, hashchange);
            } else if (!hashchange) {
                Tabs.toggleMain(activeTabNumber, hashchange);
            }
        },

        activateSecondaryTab: function(tab) {
            var tabNumber = tab.data('tab'),
                contentBlocks = tab.closest('.js-tabs--secondary').find('.js-tabs__content');
            tab.addClass('is-active').siblings().removeClass('is-active');
            contentBlocks.removeClass('is-active');
            contentBlocks.eq(tabNumber - 1).addClass('is-active');
        }

    };
})();

Tabs.init();