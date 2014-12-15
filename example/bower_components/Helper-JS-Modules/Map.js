/*global $, Expand, Media */

'use strict';

var PeopleListing = (function (args) {
    var s;

    return {
        settings: {
            lists: $('.people_listing-people'),
            line: $('.people_listing-map-line'),
            map: $('.people_listing-map'),
            mapPointsWrap: $('.people_listing-map-points'),
            popup: $('.people_listing-map-popup'),
            locations: $('.people_listing-locations-level2 > li'),
            viewToggles: $('.js-people_listing-view_toggle'),
            wrap: $('.people_listing'),
            parentExpand: $('.people_listing').parents('.js-expand-item'),
            parentExpandToggle: $('.people_listing').parents('.js-expand-item').siblings('.js-expand-toggle'),
            popupOpen: false,
            i: 0,
            fadeInterval: 0
        },

        init: function() {
            s = $.extend({}, this.settings, args);
            this.plotPoints();
            this.countChildren();
            this.bindUIActions();
        },

        bindUIActions: function() {

            s.popupToggles.on('click', function(e) {
                PeopleListing.showPopup($(this), e);
            });

            // On click of the map, close the popup if it's open.
            s.map.on('click', function(e) {
                var el = e.target,
                    closePopup = true;
                while (el) {
                    var targetClass = el.className,
                        isPopup;
                    // Check that the click event wasn't on the popup, itself
                    if (targetClass && typeof targetClass.match === 'function') {
                        isPopup = targetClass.match(/popup/g);
                        if (isPopup) {
                            closePopup = false;
                        }
                    }
                    el = el.parentNode;
                }
                if (closePopup) {
                    s.popup.empty();
                    s.line[0].style.display = 'none';
                    Expand.collapse(s.popup, null, ['mq-large']);
                    PeopleListing.toggleActiveLocation();
                    s.popupOpen = false;
                }
            });

            s.viewToggles.on('click', function(e) {
                e.preventDefault();
                s.wrap.animate({
                    opacity: 0
                }, 1200, function() {
                    s.wrap.toggleClass('people_listing-map-on').toggleClass('people_listing-map-off');
                    s.viewToggles.toggleClass('hidden');
                    s.wrap.animate({
                        opacity: 1
                    }, 1200);
                });

            });
            $(window).on('load', function() {
                PeopleListing.toggleOverflow();
            });

            // On expand contract of parent, toggle overflow so weird stuff doesn't happen
            // Timeout handles waiting until end of animation
            s.parentExpandToggle.on('click', function() {
                if (s.parentExpand.hasClass('is-expanded')) {
                    window.setTimeout(PeopleListing.toggleOverflow, 1000);
                } else {
                    PeopleListing.toggleOverflow();
                }
            });

            $(window).on('scroll', function() {
                if ($(window).scrollTop() > 300 && Media.meetsContext(['mq-large'])) {
                    PeopleListing.fadeInPoints();
                    $(window).off('scroll');
                }
            });
        },

        countChildren: function() {
            s.lists.each(function() {
                var children = $(this).children('li'),
                    childrenClass = 'l-children-' + children.length;
                $(this).parent().addClass(childrenClass);
            });
        },

        drawLine: function(left, top, lineClass) {
            s.line.removeClass('popup-active-left popup-active-right');
            s.line.addClass(lineClass);
            if (lineClass === 'popup-active-right') {
                s.line[0].style.left = (left + 5) + 'px';
                s.line[0].style.top = (top - 12) + 'px';
            } else if (lineClass === 'popup-active-left') {
                s.line[0].style.left = (left - 83) + 'px';
                s.line[0].style.top = (top - 12) + 'px';
            }
            s.line[0].style.display = 'block';
        },

        fadeInPoint: function() {
            var totalPoints = s.points.length;
            if (s.i < totalPoints) {
                s.points.eq(s.i).animate({opacity: 1}, 200);
                s.i++;
                PeopleListing.fadeInPoints();
            }

        },

        fadeInPoints: function() {
            s.fadeInterval = window.setTimeout(PeopleListing.fadeInPoint, 300);
        },

        plotPoints: function() {
            var i = 0,
                totalLocations = s.locations.length;

            for (i = 0; i < totalLocations; i++) {
                var coords = s.locations.eq(i).data('coordinates'),
                    point = '<a id="point-' + (i + 1) + '" href="#" data-location="' + (i + 1) + '" class="icon-map-point js-people_listing-map-point js-people_listing-map-popup-toggle" style="left:' + coords[0] + 'px; top:' + coords[1] + 'px;"></a>';
                s.mapPointsWrap.append(point);
            }

            s.popupToggles = $('.js-people_listing-map-popup-toggle');
            s.points = $('.js-people_listing-map-point');
        },

        positionPopup: function(el, totalPeople) {
            var dataCoords = el.closest('li').data('coordinates'),
                left = dataCoords ? dataCoords[0] : parseInt(el[0].style.left, 10),
                top = dataCoords ? dataCoords[1] : parseInt(el[0].style.top, 10),
                xOffset,
                yOffset = (top / 344) > (1/4) ? top - 60 : top + 60,
                lineClass;

            if ((left / 602) > (1/2)) {
                xOffset = left - 360;
                lineClass = 'popup-active-left';
            } else {
                xOffset = left + 80;
                lineClass = 'popup-active-right';
            }

            PeopleListing.drawLine(left, top, lineClass);

            if (totalPeople > 2) {
                top = 0;
                yOffset = 0;
                s.popup.addClass('is-scrollable');
            } else {
                s.popup.removeClass('is-scrollable');
            }

            s.popup[0].style.top = yOffset + 'px';
            s.popup[0].style.left = xOffset + 'px';

        },

        showPopup: function(el,e) {
            var dataLocation = el.data('location'),
                index = dataLocation ? el[0].id.split('-')[1] : el.closest('li')[0].id.split('-')[1],
                location = $('#location-' + index),
                locationContent = location.contents().clone(),
                totalPeople = locationContent.find('.people_listing-person').length,
                point = $('#point-' + index);
            PeopleListing.positionPopup(el, totalPeople);
            PeopleListing.toggleActiveLocation(location, point);
            e.preventDefault();
            if (!s.popupOpen) {
                s.popup.empty().append(locationContent);
                Expand.toggle(s.popup, null, ['mq-large']);
                s.popupOpen = true;
            } else {
                s.popupOpen = true;
                s.popup.empty().append(locationContent);
            }
        },

        toggleActiveLocation: function(location, point) {
            s.locations.removeClass('is-active');
            s.popupToggles.removeClass('is-active');
            if (location) {
                location.addClass('is-active');
            }
            if (point) {
                point.addClass('is-active');
            }
        },

        // Setting parent's overflow to visible prevents popups from getting cut off
        toggleOverflow: function() {
            if (s.parentExpand) {
                s.parentExpand.toggleClass('l-overflow-visible');
            }
        }

    };

})();