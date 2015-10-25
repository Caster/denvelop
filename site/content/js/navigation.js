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
                $(window).trigger('denvelop-navigating', [curPage, $(this).attr('data-id')]);
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
                $('#header a, .nav-link').on('click', navigate);
            } else {
                $('#header a, .nav-link').off();
            }
        },
        /**
         * Update page content from the given state. Possibly add the state to
         * the history too.
         */
        updatePage = function(page, addHistoryState) {
            if (page.url === curPage.url) {
                $(window).trigger('denvelop-navigated', [curPage, page]);
                return;
            }
            if (typeof(addHistoryState) !== 'boolean') {
                addHistoryState = historySupport;
            }

            // possibly push the new state on the history stack
            if (addHistoryState) {
                // not using page.url because the URL may need to be relative
                window.history.pushState(page, page.title, this.url.split('page.json?')[0]);
            }

            // update document content and header, re-attach handlers in header
            document.title = page.title;
            updatePageContent(page);
            updateHeaderLinks(false);
            $('#header').children(':not(#logo)').remove();
            $('#header').append($(page.header).filter(':not(#logo)'));
            updateHeaderLinks();
            $('html').attr('lang', page.lang);

            // swap curPage and trigger custom event
            $(window).trigger('denvelop-navigated', [curPage, page]);
            curPage = page;
        },
        /**
         * Update the page content using an animation.
         */
        updatePageContent = function(page, oldPage) {
            if (updatingPageContent) {
                updatePageContentNext = page;
                return;
            }
            if (typeof(oldPage) === 'undefined') {
                oldPage = curPage;
            }

            updatingPageContent = true;
            var content = $('#content'),
                contentM = parseInt(content.css('margin-left')),
                contentP = parseInt(content.css('padding-left')),
                contentW = content.width(),
                newContent = $('<div />', { html: page.html }),
                contentWrap = $('<div />'),
                contentWrapWrap = $('<div />'),
                scrollLeft = (getPageIndex(oldPage) < getPageIndex(page));
            contentWrap.css({
                width: contentW * 2 + contentM * 4
            });
            contentWrapWrap.css({
                width: contentW + contentM * 2,
                overflow: 'hidden',
                padding: contentP
            });
            if (content.css('display') === 'inline-block') {
                contentWrapWrap.css('display', 'inline-block');
            }
            content.add(newContent).css({
                display: 'inline-block',
                verticalAlign: 'top',
                width: contentW,
                margin: contentM,
                padding: contentP
            });
            content.wrap(contentWrapWrap);
            content.wrap(contentWrap);
            // do some animating
            var mStart = (scrollLeft ? 0 : -contentW - contentM * 2),
                mEnd = (scrollLeft ? -contentW - contentM * 2 : 0);
            if (scrollLeft) {
                content.after(newContent);
            } else {
                content.before(newContent);
            }
            content.parent().css('marginLeft', mStart).animate({
                marginLeft: mEnd
            }, function() {
                // actually remove the old content now that it is off screen
                content.parent().css('marginLeft', 0)
                content.remove();
                // make the newly shown content the actual #content
                newContent.unwrap().unwrap()
                    .attr('id', 'content')
                    .removeAttr('style');
                updatingPageContent = false;
                // check if a request has come in in the meantime
                if (updatePageContentNext !== null) {
                    var newPage = updatePageContentNext;
                    updatePageContentNext = null;
                    if (newPage.url !== page.url) {
                        updatePageContent(newPage, page);
                    }
                }
            });
        },
        /**
        * If a content update animation is currently running.
        */
        updatingPageContent = false,
        /**
        * Page to navigate to when the currently running content update
        * animation is stopped.
        */
        updatePageContentNext = null,
        /**
         * Given a page, return an absolute index that can be used to order pages.
         */
        getPageIndex = function(page) {
            var index = 0,
                split = page.url.split('/'),
                navItems = $('<div />').html(page.header).find('#nav > li');
            index += navItems.size() *
                (split.length > 1 && split[1] === 'en' ? 0 : 1);
            index += navItems.index(navItems.filter(function(index) {
                return ($('a, span', this).attr('data-url') === page.url);
            }));
            return index;
        };

    $(function() {
        if (historySupport) {
            // save the current state
            curPage = {
                id: $('.nav-icon.active').attr('data-id'),
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
                $(window).trigger('denvelop-navigating', [curPage, event.originalEvent.state.id]);
                updatePage(event.originalEvent.state, false);
            });
        }
    });

}(jQuery, window, document));
