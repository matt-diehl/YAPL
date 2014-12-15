/* global $, Bloodhound */

var Search = (function(args) {

    'use strict';

    var s;

    return {
        settings: {
            mainInput: $('.js-header-search-input'),
            mainSubmit: $('.js-header-search-submit'),
            typeaheadInputs: $('.js-typeahead')
        },

        init: function() {
            s = $.extend({}, this.settings, args);
            this.bindUIActions();
            this.implementTypeahead();
        },

        bindUIActions: function() {
            s.mainInput.on('focus', function() {
                s.mainInput.addClass('is-focused');
            });
            // On blur, keep the input open unless the user clicked on the submit button
            s.mainInput.on('blur', function(e) {
                if (!(e.relatedTarget && e.relatedTarget.className.match(/header-search-submit/))) {
                    s.mainInput.removeClass('is-focused');
                }
            });
            s.mainSubmit.on('blur', function(e) {
                if (!(e.relatedTarget && e.relatedTarget.className.match(/header-search-input/))) {
                    s.mainInput.removeClass('is-focused');
                }
            });
            s.mainSubmit.on('click', function() {
                if(s.mainInput.val() === '') {
                    return false;
                }
            });
        },

        implementTypeahead: function() {
            s.typeaheadInputs.each(function(index) {
                var el = $(this),
                    typeaheadSrc = el.data('typeahead-src'),
                    typeaheadSrcName = 'data' + index,
                    data;

                if (typeaheadSrc) {

                    data = new Bloodhound({

                        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
                        queryTokenizer: Bloodhound.tokenizers.whitespace,
                        limit: 10,
                        prefetch: {

                            // url points to a json file that contains an array of country names, see
                            // https://github.com/twitter/typeahead.js/blob/gh-pages/data/countries.json
                            url: typeaheadSrc,

                            // the json file contains an array of strings, but the Bloodhound
                            // suggestion engine expects JavaScript objects so this converts all of
                            // those strings
                            filter: function(list) {
                                return $.map(list, function(country) { return { name: country }; });
                            }
                        }
                    });

                    // kicks off the loading/processing of `local` and `prefetch`
                    data.initialize();

                    el.typeahead(null, {
                        name: typeaheadSrcName,
                        displayKey: 'name',
                        // `ttAdapter` wraps the suggestion engine in an adapter that
                        // is compatible with the typeahead jQuery plugin
                        source: data.ttAdapter()
                    });

                }

            });
        }

    };
})();

Search.init();