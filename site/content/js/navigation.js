---
yuiCompress: !!bool true
---
(function($, window, document) {

        /**
         * Currently loaded page information.
         */
    var curPage,
        /**
        * This function should be called in the jQuery click handler of a link
        * element (`a`). It will try to use AJAX and history magic to keep page
        * loading asynchronous. If it succeeds, it wil fire an event that may
        * trigger some fancy animations, who knows.
        */
        navigate = function() {
            if (historySupport) {
                $(window).trigger('denvelop-navigating');
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

            // update document content and header, re-attach handlers in header
            document.title = page.title;
            updatePageContent(page);
            updateHeaderLinks(false);
            $('#header').children(':not(#logo)').remove();
            $('#header').append($(page.header).filter(':not(#logo)'));
            updateHeaderLinks();

            // possibly push the new state on the history stack
            if (addHistoryState) {
                window.history.pushState(page, page.title, page.url);
            }

            // swap curPage and trigger custom event
            $(window).trigger('denvelop-navigated', [curPage, page]);
            curPage = page;
        },
        /**
         * Update the page content using an animation.
         */
        updatePageContent = function(page) {
            var content = $('#content'),
                contentM = parseInt(content.css('margin-left')),
                contentP = parseInt(content.css('padding-left')),
                contentW = content.width(),
                newContent = $('<div />', { html: page.html }),
                contentWrap = $('<div />'),
                contentWrapWrap = $('<div />');
            contentWrap.css({
                width: contentW * 2 + contentM * 4
            });
            contentWrapWrap.css({
                width: contentW + contentM * 2,
                overflow: 'hidden',
                padding: contentP
            });
            content.add(newContent).css({
                display: 'inline-block',
                verticalAlign: 'top',
                width: contentW,
                margin: contentM,
                padding: contentP
            });
            content.wrap(contentWrapWrap);
            content.wrap(contentWrap);
            content.after(newContent);
            content.parent().css('marginLeft', 0).animate({
                marginLeft: -contentW - contentM * 2
            }, function() {
                // actually remove the old content now that it is off screen
                content.parent().css('marginLeft', 0)
                content.remove();
                // make the newly shown content the actual #content
                newContent.unwrap().unwrap()
                    .attr('id', 'content')
                    .removeAttr('style');
            });
        }

    $(function() {
        if (historySupport) {
            // save the current state
            curPage = {
                title: document.title,
                url: window.location.pathname,
                header: $('#header').html(),
                html: $('#content').html()
            };
            window.history.replaceState(curPage, document.title, '');
            // process all navigational links to use AJAX
            updateHeaderLinks();
            // attach an event handler for when the user uses 'prev' and 'next'
            $(window).on('popstate', function(event) {
                updatePage(event.originalEvent.state, false);
            });
        }
    });

}(jQuery, window, document));
