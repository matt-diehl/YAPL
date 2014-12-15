/*global $ */

// This function handles calling secondary scripts that are only needed on certain pages
// The 'data-depend' attribute/value is applied somewhere in the html of the page
// with the value being the name of the needed module/script. Multiple scripts can be used if divided by a vertical bar ('|')

'use strict';

var Dependencies = (function () {
    var s;

    return {
        settings: {
            dependToggles: $('[data-depend]'),
            loadedDependencies: [],
            scriptsWrap: document.getElementById('page-scripts')
        },

        init: function() {
            s = this.settings;
            this.getDependencies();
        },

        getDependencies: function() {
            if (s.dependToggles.length) {
                s.dependToggles.each(function() {
                    var dependArray = $(this).data('depend').split('|'),
                        // If there aren't multiple dependencies, we'll set it to load async
                        // Otherwise we'll assume that each following script depends on the previous, and not load async
                        async = dependArray.length > 1 ? false : true;
                    for (var i = 0; i < dependArray.length; i++) {
                        // Check if dependency has already been loaded first
                        if ($.inArray(dependArray[i], s.loadedDependencies) < 0) {
                            s.loadedDependencies.push(dependArray[i]);
                            Dependencies.appendScript(dependArray[i], async);
                        }
                    }
                });
            }
        },

        appendScript: function(module, async) {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = async;
            script.src = module;
            s.scriptsWrap.appendChild(script);
        }

    };

})();

Dependencies.init();