/*global $ */

'use strict';

// This module adds a simple captcha replacement in the form of a checkbox
// It's appended with javascript to prevent some spambots from getting through it
// This module provides no validation - that should be handled in another script, as well as on the server

var HumanCheck = (function (args) {
    var s;

    return {
        settings: {
            elements: $('.js-humancheck')
        },

        init: function() {
            s = $.extend({}, this.settings, args);
            this.addCheckbox();
        },

        addCheckbox: function() {
            s.elements.append('<input id="humancheck" type="checkbox" name="humancheck" data-rules="required" data-display="Captcha"><label for="humancheck">Check if you are not a spam bot<span class="form-required">*</span></label>');
        }

    };
})();

HumanCheck.init();