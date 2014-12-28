---
yuiCompress: !!bool false
---
(function($, window, document) {

        /**
         * jQuery event handler that should be triggered when navigating has
         * completed ('denvelop-navigated' event). This will animate some icons.
         */
    var animate = function(event, prevPage, newPage) {
            // TODO
            gearRotating = false;
        },
        /**
         * jQuery event handler that should be triggered when navigating starts
         * ('denvelop-navigating' event). This will show a spinning cog-wheel.
         */
        animateLoading = function(event) {
            gearRotating = true;
            rotateSomewhat();
            gearObj.stop().animate({'top': 0}, 150);
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
         * Function that splits the envelope SVG in a foreground and background,
         * so that icons can be put 'in' the envelope.
         */
        splitEnvelope = function() {
            var bgWrapper = $('#envelope'),
                bg = Snap(bgWrapper.get(0)),
                fgWrapper = bgWrapper.clone();
            fgWrapper.addClass('logo-layer-fg')
                .on('load', function() {
                    var fg = Snap(fgWrapper.get(0));
                    fg.selectAll('path:not(:last-child)').remove();
                    bg.selectAll('path:last-child').remove();
                })
                .appendTo($('#logo'));
            // append a margin element to cover icons sticking out of the bottom
            // of the envelope
            var marginEl = $('<div />');
            marginEl.css({
                'position': 'absolute',
                'top': parseInt(bgWrapper.css('marginTop'))
                        + bgWrapper.height(),
                'right': 0,
                'bottom': 0,
                'left': 0,
                'z-index': 3,
                'background': $('#header').css('background-color')
            });
            $('#logo').append(marginEl);
        };

    $(function() {
        // make gear icon globally available for easy access
        gearObj = $('#loading-gear');
        gear = Snap(gearObj.get(0)).select('g');
        gearObj.css({'display': 'block', 'top': '20%'});
        // split the envelope icon in parts, so that we can move icons in and
        // out of the envelope easily and also add a margin element that covers
        // the gear when it moves out of the envelope (and other icons too)
        splitEnvelope();
        // bind to the custom event that is fired as soon as a navigation link
        // is clicked and intercepted, but the page must still be loaded
        $(window).on('denvelop-navigating', animateLoading);
        // bind to the custom event that is fired when navigation is changed
        // and the event could be intercepted and handled using JS
        $(window).on('denvelop-navigated', animate);
    });

}(jQuery, window, document));
