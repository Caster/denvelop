---
yuiCompress: !!bool false
---
(function($, window, document) {

    var $c = $('#footer'),
        $f = $c.find('#feedback'),
        $i = $c.find('#input'),
        $fi = $c.find('#fake-input'),
        $cursor = $c.find('#cursor'),
        $dummy = $('<div />', {id: 'dummy'}).appendTo('body'),
        cEnabled = false,
        cInput = '',
        cLastKeyWasTab = false,
        cMaxLen = 40,
        cToggleKey = 192, // this is ~
        cmds = {}, // defined later
        spaceWidth = 0, // defined later
        siteMap = <%= get_sitemap %>, // used for completion (ls/cd)
        siteMapIds = <%= get_sitemap_ids %>, // used for navigation

    /**
     * Useful to create alias functions.
     */
    alias = function(cmd, type, extraArguments) {
        return function() {
            if (type === 'completers') {
                if (typeof(extraArguments) === 'object') {
                    Array.prototype.push.call(arguments, extraArguments);
                }
                return completers[cmd].apply(this, arguments);
            }
            return cmds[cmd].apply(this, arguments);
        }
    },

    /**
     * Given a command, return options what the command could be.
     */
    completeCmd = function(cmd) {
        var cmdSplit = cmd.split(/\s+/g);
        if (cmdSplit.length === 1) {
            return helpers.filterPrefixed(cmd, Object.keys(cmds));
        } else if (completers.hasOwnProperty(cmdSplit[0])) {
            cmd = cmdSplit.splice(0, 1);
            var matches = completers[cmd].apply(this, cmdSplit);
            matches.prefix = cmd;
            return matches;
        }
        return [];
    },

    /**
     * Encode HTML entities in the given string, and make every space a
     * non-breaking one. Useful when showing user input to user.
     *
     * \param str The string to encode.
     * \param plainStr Optional boolean, default \c false. When true, return
     *            a string with plain characters instead of HTML escape
     *            sequences. The string will be Unicode.
     */
    encode = function(str, plainStr) {
        if (typeof(str) !== 'string') {
            return '';
        }
        if (typeof(plainStr) !== 'boolean') {
            plainStr = false;
        }
        return str.replace(/[\u00A0-\u9999<>\& ]/gim, function(i) {
            if (i === ' ') {
                return (plainStr ? '\u00A0' : '&nbsp;');
            }
            return (plainStr ? i.charAt(0) : '&#' + i.charCodeAt(0) + ';');
        });
    },

    /**
     * Compute the width of the given string using a dummy element.
     */
    getTextWidth = function(str) {
        // use a cached dummy
        return $dummy.html(str).width();
    },

    /**
     * Triggered for \c keypress events on the window. Should toggle the
     * console status for the activation key.
     */
    onKeyDown = function(e) {
        // handle tab here, before it changes the focus
        // also respond to global toggle key events
        if (e.which === 9 || e.which === cToggleKey) {
            onKeyUp(e);
        }
    },

    /**
     * Handler for key press events in the console input. Should only do
     * something if the console is enabled.
     */
    onKeyUp = function(e) {
        if (cEnabled && e.which === cToggleKey) {
            return;
        }
        // see if we should handle this key press
        var handled = true,
            thisKeyIsTab = false;
        switch (e.which) {
            case cToggleKey: // is this to blur the console?
                cEnabled = !cEnabled;
                if (cEnabled) {
                    $fi.focus();
                } else {
                    $i.blur();
                }
                break;
            case 8: // backspace
                // we only update the input after the switch, that is all
                break;
            case 9: // tab
                thisKeyIsTab = true;
                if (e.type === 'keyup') {
                    // already handled in keydown
                    break;
                }
                var matches = completeCmd(cInput);
                if (matches.length === 1) {
                    setInput((matches.prefix ? matches.prefix + ' ' : '') +
                        matches[0] + (matches.noSpace ? '' : ' '));
                } else if (matches.length > 1 && cLastKeyWasTab) {
                    setFeedback(matches);
                }
                break;
            case 13: // enter
                setFeedback(parseCmd(cInput));
                cmds.clear();
                break;
            default:
                handled = false;
        }
        // did we do anything? then mark event as handled
        if (handled) {
            e.preventDefault();
            e.stopPropagation();
            cLastKeyWasTab = thisKeyIsTab;
            // update text in input
            updateInput();
        }
        // always update cursor position, because we do not explicitly handle
        // home, end, arrow keys, et cetera
        updateCursorPosition();
    },

    /**
     * See if we know the given command and act on it.
     */
    parseCmd = function(cmd) {
        cmd = cmd.trim().split(/\s+/g);
        if (cmd.length > 0) {
            if (cmds.hasOwnProperty(cmd[0])) {
                var cmdNm = cmd.splice(0, 1);
                return cmds[cmdNm[0]].apply(this, cmd);
            }
        }
        return 'desh: Unknown command "' + cmd + '".';
    },

    /**
     * Shorthand function to create a function that returns its argument.
     */
    s = function(str) {
        return function() {
            return str;
        }
    },

    /**
     * Set the contents of the feedback.
     */
    setFeedback = function(str) {
        if (typeof(str) !== 'string') {
            if ((Array.isArray && Array.isArray(str)) ||
                    str instanceof Array) {
                str = str.join('    ');
            } else {
                str = '';
            }
        }
        $f.html(encode(str.toLowerCase()));
        $c.toggleClass('tall', (str != ''));
    },

    /**
     * Set the contents of the input.
     *
     * Both the hidden and the fake one. Does need a call to updateInput to
     * see the effect though.
     */
    setInput = function(str) {
        cInput = str.toLowerCase();
        $i.val(cInput);
    },

    /**
     * Update the position of the cursor so it matches the position of the
     * cursor in the hidden input element.
     */
    updateCursorPosition = function() {
        // position cursor absolute iff console is enabled
        $cursor.toggleClass('dynamic', cEnabled);
        if (cEnabled) {
            // determine cursor position
            var input = $i.get(0),
                selS = input.selectionStart,
                selE = input.selectionEnd,
                lastChar = cInput.substr(selE, 1);
            // selection is not supported, only cursor movement
            if (selE !== selS) {
                input.selectionStart = selE;
            }
            // get the length of the string up to the cursor
            $cursor.css('margin-left', getTextWidth(encode('>' + cInput.substr(0, selE))));
            if (lastChar === '') {
                $cursor.html('&nbsp;').css('width', '.7em');
            } else if (lastChar === ' ') {
                $cursor.html('&nbsp;').css('width', spaceWidth);
            } else {
                $cursor.text(lastChar).css('width', '');
            }
        } else {
            $cursor.html('&nbsp;').css({
                marginLeft: '',
                width: ''
            });
        }
    },

    /**
     * Update input text from the global \c cInput variable.
     */
    updateInput = function() {
        $fi.html(encode(cInput));
    },

    /**
     * Command definitions. Hey. Cheater! Reading the source and all that.
     * Well. Have fun, hacker :-)
     */
    cmds = {
        'about': alias('help'),
        'about-me': s('This is desh, the Denvelop Shell, programmed by Thom.'),
        'cd': function(path) {
            if (typeof(path) === 'undefined') {
                path = '/';
            }
            // make path absolute
            path = helpers.dirResolve(location.pathname, path);
            // if the path can be found in the sitemap, go there, otherwise error
            if (siteMap.indexOf(path) === -1) {
                return 'desh: Invalid path.';
            }
            // navigate to page
            $(window).trigger('denvelop-navigate', [path, siteMapIds[path]]);
        },
        'clear': function() { setInput(''); updateInput(); },
        'help': s('desh: This is a tiny console for geeks. No room for ' +
                    'further help, sorry.'),
        'ls': function(path) {
            var cwd = location.pathname,
                items = [], i, l, item, itemIndex;
            if (typeof(path) === 'string') {
                cwd = helpers.dirResolve(cwd, path);
                if (cwd === null) {
                    return 'desh: Invalid path.';
                }
            }
            // consider all items the user may mean
            for (i = 0, l = siteMap.length; i < l; ++i) {
                if (siteMap[i].startsWith(cwd)) {
                    item = siteMap[i].substr(cwd.length);
                    // the item itself is referred to with a single dot
                    if (item === '') {
                        item = '.';
                    }
                    // we do not list directories recursively
                    itemIndex = item.indexOf('/');
                    if (itemIndex < 0 || itemIndex === item.length - 1) {
                        items.push(item);
                    }
                }
            }
            // if may be possible to move up a directory
            if (cwd !== '/' && items.indexOf('.') !== -1) {
                items.push('..');
            }
            // present items in sorted order
            items.sort();
            return items;
        },
        'theme': function(name) {
            $(window).one('denvelop-theme-switched', function(e, switched, newTheme) {
                if (!switched) {
                    if (typeof(name) === 'undefined') {
                        setFeedback('desh: Current theme is "' + newTheme + '".');
                    } else {
                        setFeedback('desh: Invalid theme name.');
                    }
                }
            });
            $(window).trigger('denvelop-theme-switch', [name]);
        }
    },

    /**
     * Tab completion functions per command.
     */
    completers = {
        'cd': alias('ls', 'completers'),
        'ls': function(path) {
            if (typeof(path) !== 'string') return [];
            // absolute path?
            var absPath = false;
            if (path.charAt(0) === '/') {
                path = path.substr(1);
                absPath = true;
            }
            // split in directory and basename
            var dirName = path.split('/'),
                baseName = dirName.pop();
            if (!baseName) baseName = '';
            if (baseName === '.' || baseName === '..') {
                dirName.push(baseName);
                baseName = '';
            }
            dirName = dirName.join('/');
            if (absPath) {
                dirName = '/' + dirName;
            }
            // use this to call ls and filter the results
            var lsResult = cmds.ls(dirName);
            if (typeof(lsResult) === 'string') {
                return lsResult; // error message
            }
            lsResult = helpers.filterPrefixed(baseName, lsResult).
                map(function(c) {
                    if (dirName !== '') {
                        return dirName + (dirName === '/' ? '' : '/') + c;
                    }
                    return c;
                });
            lsResult.noSpace = true;
            return lsResult;
        },
        'theme': function(name) {
            var themeNames = [];
            $('link[rel$=stylesheet]').each(function() {
                themeNames.push($(this).attr('title').match(/-(\w+)$/)[1]);
            });
            return helpers.filterPrefixed(name, themeNames);
        }
    },

    /**
     * Helper function definitions.
     */
    helpers = {
        dirDiff: function(dirA, dirB) {
            var dA = helpers.trimSlashes(dirA).split('/'),
                dB = helpers.trimSlashes(dirB).split('/'),
                diff = [],
                offset = 0;
            while (dA.length > offset && dB.length > offset &&
                    dA[offset] === dB[offset]) {
                offset++;
            }
            for (var i = offset; i < dA.length; i++) { diff.push('..'); }
            for (var i = offset; i < dB.length; i++) { diff.push(dB[i]); }
            if (diff.length === 0) { diff.push('.'); }
            return diff.join('/');
        },
        dirResolve: function(dir, subDir) {
            if (dir.charAt(0) !== '/') {
                console.error('dirResolve can only resolve paths from absolute paths.');
            }
            var d = dir.split('/'),
                lastSlash = (d[d.length - 1] === '');
            if (lastSlash) {
                d.pop();
            }
            // remove first empty component, since we asserted that dir is absolute
            d.splice(0, 1);

            subDir = (subDir === '' ? [] : subDir.split('/'));
            for (var i = 0; i < subDir.length; i++) {
                if (subDir[i] === '') {
                    if (i === 0) {
                        d = ['']; // absolute path support
                    }
                    continue;
                }
                if (subDir[i] === '.') continue;
                if (subDir[i] === '..') {
                    if (typeof(d.pop()) === 'undefined') {
                        return null;
                    }
                } else {
                    d.push(subDir[i]);
                }
            }

            if (lastSlash) {
                d.push('');
            }
            var result = d.join('/');
            if (result.charAt(0) !== '/') {
                result = '/' + result;
            }
            return result;
        },
        filterPrefixed: function(key, haystack) {
            var matches = [];
            for (var i = 0; i < haystack.length; i++) {
                if (haystack[i].indexOf(key) === 0) {
                    matches.push(haystack[i]);
                }
            }
            return matches;
        },
        trimSlashes: function(str) {
            return str.replace(/\/^|\/$/g, '');
        }
    };

    /**
     * Initialize console on document load.
     */
    $(function() {
        // calculate the width of a non-breaking space
        spaceWidth = getTextWidth('&nbsp;');

        if ($c.size() > 0) {
            var initialText = $fi.text(),
                feedbackUp = $f.text();
            // enable toggling the console
            $(window).on('keydown', onKeyDown);
            // enable console writing
            $i.on('keyup', onKeyUp);
            $i.on('input', function(e) {
                // in case a user left with alt+tab
                cEnabled = true;
                $c.addClass('active');
                // update input contents
                cInput = $i.val().toLowerCase();
                updateInput();
                updateCursorPosition();
            });
            // update state if console is blurred/focused
            $fi.on('focus', function() {
                // in case focus happens outside our control (e.g. by clicking)
                cEnabled = true;
                $c.addClass('active');
                updateInput();
                setFeedback(feedbackUp);
                $i.focus();
                updateCursorPosition();
            });
            $i.on('blur', function() {
                cEnabled = false; // in case blur happens outside our control
                $c.removeClass('active');
                $fi.text(initialText);
                feedbackUp = $f.text();
                setFeedback('');
                updateCursorPosition();
            });
        }
    });

}(jQuery, window, document));
