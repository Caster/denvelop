---
yuiCompress: !!bool false
---
(function($, window, document) {

        /**
         * jQuery event handler that should be triggered when navigating has
         * completed ('denvelop-navigated' event). This will animate some icons.
         */
    var animate = function(event, prevPage, newPage) {
            // stop spinning the cog-wheel and hide it
            gearRotating = false;
            // show the icon of the new page
            if (prevPage.id === newPage.id) {
                var icon = $('#nav-icon-' + newPage.id);
                if (icon.is(':animated')) {
                    icon.data('stop-hiding', true);
                } else {
                    setIconVisible(newPage.id, true);
                }
            } else {
                setIconVisible(newPage.id, true);
            }
        },
        /**
         * jQuery event handler that should be triggered when navigating starts
         * ('denvelop-navigating' event). This will show a spinning cog-wheel.
         */
        animateLoading = function(event, page) {
            // start spinning the cog-wheel and show it
            gearRotating = true;
            rotateSomewhat();
            gearObj.stop().animate({'top': 0}, 150);
            // hide the icon of the current page
            setIconVisible(page.id, false);
        },
        gear = null,
        gearObj = null,
        gearRotating = false,
        rotateSomewhat = function() {
            gear.stop()
                .attr({'transform': 'rotate(0 80 96)'})
                .animate({'transform': 'r45,80,96'}, 1000, function() {
                    if (gearRotating) {
                        // reset transformation and repeat it (so it looks infinite)
                        gear.attr({'transform': 'rotate(0 80 96)'});
                        rotateSomewhat();
                    } else {
                        // stop, but keep it spinning while it goes down
                        gear.stop()
                            .attr({'transform': 'rotate(0 80 96)'})
                            .animate({'transform': 'r45,80,96'}, 1000);
                        gearObj.stop().animate({'top': '20%'}, 150);
                    }
                });
        },
        /**
         * Show or hide a navigation icon.
         */
        setIconVisible = function(id, visible) {
            $('#nav-icon-' + id).stop().animate({
                'top': (visible ? '-50%' : '-100%'),
                'left': (visible ? '-8%' : '8%')
            }, function() {
                var icon = $(this);
                if (icon.data('stop-hiding') && !visible) {
                    icon.removeData('stop-hiding');
                    visible = true;
                }
                icon.css('z-index', (visible ? 7 : 2));
                if (!visible) {
                    icon.delay(200);
                }
                icon.animate({
                    'top': (visible ? '15%' : '28%'),
                    'left': (visible ? '15%' : '0%')
                }, function() {
                    icon.css('z-index', '');
                    icon.toggleClass('active', visible);
                    // maybe, the opposite needs to happen now
                    if (icon.data('stop-hiding') && !visible) {
                        icon.removeData('stop-hiding');
                        setIconVisible(id, true);
                    }
                });
            });
        },
        /**
         * Function that splits the envelope SVG in a foreground and background,
         * so that icons can be put 'in' the envelope.
         */
        splitEnvelope = function() {
            var bgWrapper = $('#envelope');
            svgObjOnLoad(bgWrapper, splitEnvelopeOnLoad);

            // append a margin element to cover icons sticking out of the bottom
            // of the envelope
            $('#logo').append($('<div />', {'id': 'logo-margin-cover'}));
        },
        /**
         * Called when the envelope SVG element loads.
         */
        splitEnvelopeOnLoad = function() {
            if ($(this).data('loaded')) {
                return;
            }

            $(this).data('loaded', true);
            var bg = Snap(this),
                fgWrapper = $(this).clone();
            fgWrapper.addClass('logo-layer-fg')
                .on('load', function() {
                    var fg = Snap(fgWrapper.get(0));
                    fg.selectAll('path:not(:last-child)').remove();
                    bg.selectAll('path:last-child').remove();
                    // now show the gear icon, that is covered by the envelope fg
                    gearObj.css({'display': 'block', 'top': '20%'});
                    // and show the other navigation icons
                    $('.nav-icon').css('display', 'block');
                })
                .appendTo($('#logo'));
        },
        /**
         * Called when the gear SVG element loads.
         */
        gearOnLoad = function() {
            if (gear === null) {
                gear = Snap(this).select('g');
            }
        },
        /**
         * Attach an onload event listener to an object element.
         * This works in both Chrome and Firefox.
         */
        svgObjOnLoad = function(obj, onLoad, onLoadParams) {
            if (typeof(onLoadParams) === 'undefined') {
                onLoadParams = [];
            }

            obj.on('load', onLoad);
            var objEl = obj.get(0);
            if (typeof(objEl.contentDocument) !== 'undefined' &&
                    objEl.contentDocument !== null &&
                    objEl.contentDocument.readyState === 'complete' &&
                    objEl.contentDocument.getElementsByTagName('svg').length > 0) {
                onLoad.apply(objEl, onLoadParams);
            }
        };

    $(function() {
        // make gear icon globally available for easy access
        gearObj = $('#loading-gear');
        svgObjOnLoad(gearObj, gearOnLoad);
        // split the envelope icon in parts, so that we can move icons in and
        // out of the envelope easily and also add a margin element that covers
        // the gear when it moves out of the envelope (and other icons too)
        splitEnvelope();
        // show navigation icon
        $('.nav-icon.active').css('display', 'block');
        // bind to the custom event that is fired as soon as a navigation link
        // is clicked and intercepted, but the page must still be loaded
        $(window).on('denvelop-navigating', animateLoading);
        // bind to the custom event that is fired when navigation is changed
        // and the event could be intercepted and handled using JS
        $(window).on('denvelop-navigated', animate);
    });

}(jQuery, window, document));
