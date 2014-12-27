---
yuiCompress: !!bool false
---
(function($, window, document) {

    /**
     * This function should be called in the jQuery click handler of a link
     * element (`a`). It will try to use AJAX and history magic to keep page
     * loading asynchronous. If it succeeds, it wil fire some fancy animations.
     */
    var navigate = function() {
            if (historySupport) {
                $.ajax({
                    url: $(this).attr('href') + 'page.json',
                    success: updatePage,
                    dataType: 'json',
                    cache: false
                });
            }
            // if there is no history support, do the default action (follow the
            // link), otherwise we have handled it already above
            return !historySupport;
        },
        /**
         * If the browswer supports the history API. This is checked by seeing
         * if functions we need are defined. We hope they are defined correctly.
         */
        historySupport = (typeof(window.history.pushState) === 'function' &&
                          typeof(window.history.replaceState) === 'function'),
        /**
         * Add click handlers to links in the navigation menu to call the
         * `navigate` function defined above.
         */
        updateHeaderLinks = function(enable) {
            if (typeof(enable) !== 'boolean') {
                enable = true;
            }

            if (enable) {
                $('#header a').on('click', navigate);
            } else {
                $('#header a').off();
            }
        },
        /**
         * Update page content from the given state. Possibly add the state to
         * the history too.
         */
        updatePage = function(page, addHistoryState) {
            if (typeof(addHistoryState) !== 'boolean') {
                addHistoryState = true;
            }

            document.title = page.title;
            $('#content').html(page.html);
            updateHeaderLinks(false);
            $('#header').children(':not(#logo)').remove();
            $('#header').append($(page.header).filter(':not(#logo)'));
            updateHeaderLinks();

            if (addHistoryState) {
                window.history.pushState(page, page.title, page.url);
            }
        };

    $(function() {
        if (historySupport) {
            // save the current state
            window.history.replaceState({
                title: document.title,
                url: '',
                header: $('#header').html(),
                html: $('#content').html()
            }, document.title, '');
            // process all navigational links to use AJAX
            updateHeaderLinks();
            // attach an event handler for when the user uses 'prev' and 'next'
            $(window).on('popstate', function(event) {
                updatePage(event.originalEvent.state, false);
            });
        }
    });

}(jQuery, window, document));
