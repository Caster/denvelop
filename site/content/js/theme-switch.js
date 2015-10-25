---
yuiCompress: !!bool true
---
(function($, window, document) {

    var $head = $('head'),

    switchTo = function(theme) {
        var links = $('link[rel=stylesheet]');
        links.each(function() {
            this.disabled = true;
        });
        $('link[rel=stylesheet][title=theme-' + theme + ']').get(0).disabled = false;
    };

    /**
     * Initialize handlers on page load.
     */
    $(function() {
        $('#content').on('click', '.theme', function() {
            var $link = $(this);
            if (!$link.hasClass('active')) {
                switchTo($link.data('theme-name'));
                $link.addClass('active').siblings().removeClass('active');
            }
        });
    });

}(jQuery, window, document));
