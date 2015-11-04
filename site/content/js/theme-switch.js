---
yuiCompress: !!bool true
---
(function($, window, document) {

    var $head = $('head'),
        curTheme = null,
        curThemeIsInverse = false,

    updateImages = function() {
        $('img.logo.invertible').each(function() {
            var $img = $(this);
            if (curThemeIsInverse) {
                $img.attr('src', $img.attr('src').replace(/\.svg$/, '-i.svg'));
            } else {
                $img.attr('src', $img.attr('src').replace(/-i\.svg$/, '.svg'));
            }
        });
    },

    switchTo = function(theme, isInverse) {
        // save theme name globally
        curTheme = theme;
        curThemeIsInverse = isInverse;
        // update stylesheet disabledness
        var links = $('link[rel$=stylesheet]');
        links.each(function() {
            this.disabled = true;
        });
        $('link[rel$=stylesheet][title=theme-' + theme + ']').get(0).disabled = false;
        // update image references
        updateImages();
    };

    /**
     * Initialize handlers on page load.
     */
    $(function() {
        // set current theme (todo: use cookies?)
        curTheme = 'default';
        // disable all but first stylesheet
        $('link[rel$=stylesheet]:not(:eq(0))').each(function() {
            this.disabled = true;
        });
        // enable switching
        $('body').on('click', '.theme', function() {
            var $link = $(this);
            if (!$link.hasClass('active')) {
                switchTo($link.data('theme-name'), $link.hasClass('theme-inverse'));
                $link.addClass('active').siblings().removeClass('active');
            }
        });
        // update pages when they are loaded
        $(window).on('denvelop-navigated', function(e, prevPage, curPage) {
            // set active theme on home page
            if (curPage.id === 'home') {
                $('#themes .theme').each(function() {
                    var $theme = $(this);
                    $theme.toggleClass('active',
                        $theme.data('theme-name') === curTheme);
                });
            }
            // possibly update images that need inversion
            updateImages();
        });
    });

}(jQuery, window, document));
