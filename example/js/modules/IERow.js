/*global $*/

// This module looks for elements with .ie-row to apply grid 
// classes to immediate children (for nth-child support)

var IERow = (function() {
    'use strict';

    var s;

    return {
        settings: {
            ieRows: $('.js-ie-row')
        },

        init: function(args) {
            s = $.extend({}, this.settings, args);
            
            $.each(s.ieRows, function(i, row) {
                var cols = $(row).find('> *');

                $.each(cols, function(i, col) {
                    i++;

                    var divisClass = i % 2 === 0 ? 'nth-even' : 'nth-odd';

                    $(col).addClass('nth-' + i + 'n ' + divisClass);
                });
            });
        }
    };

})();

IERow.init();