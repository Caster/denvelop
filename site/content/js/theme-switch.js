---
yuiCompress: !!bool true
---
(function($, window, document) {

    var $head = $('head'),
        curTheme = null,
        curThemeIsInverse = false,
        haveLocalStorage = null,

    /**
     * \url https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
     */
    storageAvailable = function(type) {
        try {
            var storage = window[type],
                x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        } catch(e) {
            return false;
        }
    },

    switchTo = function(theme, isInverse) {
        // save theme name globally
        curTheme = theme;
        curThemeIsInverse = isInverse;
        themeStorage('save');
        // do actual switch
        updateStylesheets();
        updateImages();
        // notify page of theme change
        window.setTimeout(function() {
            $(window).trigger('denvelop-theme-switched', [true, curTheme]);
        }, 400); // at this point, theme switching more or less completed
    },

    /**
     * Function that can be used to access the local storage for loading/saving
     * the theme and if it is an inverted theme.
     *
     * \param action String indicating what to do. Can be 'load' or 'save'.
     * \return A boolean indicating if the action was successful.
     */
    themeStorage = function(action) {
        // check support if not done yet
        if (haveLocalStorage === null) {
            haveLocalStorage = storageAvailable('localStorage');
        }
        // if no support, do nothing
        if (!haveLocalStorage) {
            return false;
        }
        // either load or save the theme from/to storage
        if (action === 'load') {
            var storage = window.localStorage,
                theme = storage.getItem('themeName'),
                themeInverted = storage.getItem('themeInverted');
            if (theme !== null && themeInverted !== null) {
                curTheme = theme;
                curThemeIsInverse = (themeInverted === '1');
                return true;
            }
            return false;
        } else if (action === 'save') {
            var storage = window.localStorage;
            storage.setItem('themeName', curTheme);
            storage.setItem('themeInverted', (curThemeIsInverse ? '1' : '0'));
            return true;
        }
        // unknown action
        return false;
    },

    /**
     * Update the classes of the theme swatches on the page, if any.
     */
    updateActiveTheme = function() {
        $('#themes .theme[data-theme-name="' + curTheme + '"]').
            addClass('active').
            siblings().
            removeClass('active');
    },

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

    /**
     * Update disabled stylesheets.
     */
    updateStylesheets = function() {
        var links = $('link[rel$=stylesheet][title^=theme-]');
        links.each(function() {
            this.disabled = true;
        });
        $('link[rel$=stylesheet][title=theme-' + curTheme + ']').get(0).disabled = false;
    };

    /**
     * Initialize handlers on page load.
     */
    $(function() {
        // set current theme, possibly use localStorage
        if (!themeStorage('load')) {
            curTheme = 'default';
            curThemeIsInverse = false;
        }
        updateStylesheets();
        updateImages();
        updateActiveTheme();
        // enable switching
        var $body = $('body'),
            $window = $(window);
        $body.on('click', '.theme', function() {
            var $link = $(this);
            if (!$link.hasClass('active')) {
                switchTo($link.data('theme-name'), $link.hasClass('theme-inverse'));
                updateActiveTheme();
            }
        });
        // update pages when they are loaded
        $window.on('denvelop-navigated', function(e, prevPage, curPage) {
            // set active theme on home page
            if (curPage.id === 'home') {
                updateActiveTheme();
            }
            // possibly update images that need inversion
            updateImages();
        });
        // after having set the theme and now that everything has settled,
        // enable transitions when changing the theme from now on
        setTimeout(function() {
            $body.addClass('loaded');
            $window.on('denvelop-theme-switch', function(e, themeName) {
                var $link = $('link[rel$=stylesheet][title="theme-' + themeName + '"]');
                if ($link.size() > 0) {
                    switchTo($link.attr('title').match(/-(\w+)$/)[1], ($link.data('inverse') === 1));
                    updateActiveTheme();
                } else {
                    // we did not switch
                    setTimeout(function() {
                        $window.trigger('denvelop-theme-switched', [false, curTheme]);
                    });
                }
            });
        }, 1000);
    });

}(jQuery, window, document));
