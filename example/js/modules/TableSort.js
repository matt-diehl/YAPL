/*global $ */

// Tabl sort functionality

var TableSort = (function (args) {
    'use strict';

    var wrap = $('.js-table--sortable'),
        s;

    return {
        settings: {
            items: wrap.find('tbody > tr'),
            groups: [],
            sortToggles: wrap.find('.js-table__sort-toggle'),
            totalColumns: 0
        },

        init: function() {
            s = $.extend({}, this.settings, args);
            s.totalColumns = s.sortToggles.length;
            this.setSearchGroups();
            this.setInitialValues();
            this.bindUIActions();
            s.sortToggles.filter('[data-col="1"]').trigger('click');
        },

        bindUIActions: function() {
            s.sortToggles.on('click', TableSort.sort);
        },

        setSearchGroups: function() {
            for (var i = 0; i < s.totalColumns; i++) {
                s.groups.push([]);
            }
        },

        setInitialValues: function() {
            s.items.each(function(searchItemIndex) {
                var el = $(this),
                    id = 'psr-' + searchItemIndex,
                    cols = el.find('td');

                cols.each(function(colIndex) {
                    var col = $(this),
                        term = col.data('sort-val');

                    s.groups[colIndex].push([id, term]);
                });

                el.attr('id', id);

            });

        },

        sort: function(e) {
            var desc = true,
                el = $(this);

            e.preventDefault();

            if (el.attr('data-order') === 'desc') {
                desc = false;
                el.attr('data-order', 'asc');
            } else {
                el.attr('data-order', 'desc');
            }

            s.sortToggles.attr('data-active', 'inactive');
            el.attr('data-active', 'active');

            TableSort.sortSearchResults(el.attr('data-col'), desc);
        },

        sortSearchResults: function(which, desc) {
            var arr = s.groups[which - 1];

            arr.sort(function(a, b) {
                if (a[1] < b[1]) {
                    return -1;
                }
                if (a[1] > b[1]) {
                    return 1;
                }
                return 0;
            });

            if (desc) {
                arr.reverse();
            }

            TableSort.displaySortedSearch(arr);
        },

        displaySortedSearch: function(arr) {
            for (var i = 0; i < arr.length; i++) {
                wrap.append($('#' + arr[i][0]));
            }
        }

    };
})();

TableSort.init();
