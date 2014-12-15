/*global $ */

// A little module for displaying chosen fields from a group of form fields

'use strict';

var Chosenbox = (function () {
    var s;

    return {
        settings: {
            docbody: $('body'),
            groups: $('.js-chosenbox-group'),
            wraps: $('.js-chosenbox-wrap'),
            toggles: $('.js-chosenbox-toggle'),
            showToggles: $('.js-chosenbox-show-children'),
            items: $('.js-chosenbox-items'),
            popupsOpen: false
        },

        init: function() {
            s = this.settings;
            this.bindUIActions();
            this.showActiveFilters();
        },

        bindUIActions: function() {
            s.docbody.on('click', function(e) {
                Chosenbox.closeOpenPopups(e);
            });
            s.showToggles.on('click', function() {
                if (!$(this).hasClass('is-disabled')) {
                    $(this).find('.js-chosenbox-group').toggleClass('is-open').toggleClass('is-closed');
                }
            });
            s.toggles.on('change', function() {
                Chosenbox.updateBox($(this));
            });
            s.items.on('click', '.js-chosenbox-remove', function(e) {
                e.preventDefault();
                var parent = $(this).parent('li'),
                    parentSiblings = parent.siblings(),
                    formElements = parent.closest('.js-chosenbox-wrap').find('.js-chosenbox-toggle'),
                    type = formElements[0].type.toLowerCase();
                if (parentSiblings.length === 0) {
                    parent.closest('.js-chosenbox-items').addClass('is-empty');
                }
                if (formElements.length) {
                    if (type === 'select-one') {
                        formElements[0].options.selectedIndex = 0;
                    } else if (type === 'checkbox') {
                        var uncheck = $(this).data('chosen-remove');
                        $(uncheck).prop('checked', false);
                    }
                }
                parent.remove();

            });
        },

        updateBox: function(el) {
            var box = el.closest('.js-chosenbox-wrap').find('.js-chosenbox-items'),
                choices = [],
                totalChoices,
                type = el[0].type.toLowerCase();
            // If it's a single select, grab the inner html of the selected option
            if (type === 'select-one') {
                var selectedIndex = el[0].selectedIndex,
                    selectedValue = el[0].options[selectedIndex].innerHTML;
                choices.push(selectedValue);
                box.removeClass('is-empty').empty().append('<li>' + choices[0] + '<a href="#" class="chosenbox-remove js-chosenbox-remove">X</a></li>');
            // If it's a checkbox group, grab the inner html of each related label
            } else if (type === 'checkbox') {
                choices = el.closest('.js-chosenbox-group').find(':checked');
                totalChoices = choices.length;
                box.removeClass('is-empty').empty();
                for (var i = 0; i < totalChoices; i++) {
                    box.append('<li>' + choices[i].labels[0].innerHTML + '<a href="#" data-chosen-remove="#' + choices[i].id + '" class="chosenbox-remove js-chosenbox-remove">X</a></li>');
                }
            }
        },

        showActiveFilters: function() {
            s.toggles.each(function() {
                var type = $(this)[0].type.toLowerCase();
                // Update the box if the element has an option selected
                if (type === 'select-one' && $(this)[0].selectedIndex) {
                    Chosenbox.updateBox($(this));
                }
                else if (type === 'checkbox' && $(this).prop('checked')) {
                    Chosenbox.updateBox($(this));
                }
            });
        },

        closeOpenPopups: function(e) {
            var el = e.target,
                closePopup = true;
            while (el) {
                var targetClass = el.className,
                    isPopup;
                if (targetClass && typeof targetClass.match === 'function') {
                    isPopup = targetClass.match(/js-chosenbox-wrap/g);
                    if (isPopup) {
                        closePopup = false;
                    }
                }
                el = el.parentNode;
            }
            if (closePopup) {
                $('.js-chosenbox-group.is-open').removeClass('is-open').addClass('is-closed');
            }
        }

    };
})();
Chosenbox.init();