---
yuiCompress: !!bool true
---
(function($, window, document) {

    var $c = $('#footer'),
        $i = $c.find('#input'),
        cEnabled = false,

    /**
     * Handler for key press events in the console input. Should only do
     * something if the console is enabled.
     */
    onConsoleKeyPress = function(e) {
        if (!cEnabled) {
            return;
        }
        // TODO: never called
        console.log(e);
    },

    /**
     * Triggered for \c keypress events on the window. Should toggle the
     * console status for the activation key.
     */
    onKeyPress = function(e) {
        if (e.key === '~') {
            $c.toggleClass('active');
            cEnabled = !cEnabled;
            console.log(cEnabled);
            if (cEnabled) {
                $i.focus();
            } else {
                $i.blur();
            }
        }
    };

    $(function() {
        if ($c.size() > 0) {
            // enable toggling the console
            $(window).on('keypress', onKeyPress);
            // enable console writing
            $i.on('keypress', onConsoleKeyPress);
        }
    });

}(jQuery, window, document));
