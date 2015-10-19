---
yuiCompress: !!bool true
---
(function($, window, document) {

    var $c = $('#footer'),
        $f = $c.find('#feedback'),
        $i = $c.find('#input'),
        cEnabled = false,
        cInput = '',
        cLastKeyWasTab = false,
        cMaxLen = 40,
        cToggleKey = '~',
        cmds = {}, // defined later

    /**
     * Useful to create alias functions.
     */
    alias = function(cmd, type) {
        return function() {
            if (type === 'completers') {
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
     */
    encode = function(str) {
        if (typeof(str) !== 'string') {
            return '';
        }
        return str.replace(/[\u00A0-\u9999<>\& ]/gim, function(i) {
            if (i === ' ')  return '&nbsp;';
                 return '&#' + i.charCodeAt(0) + ';';
        });
    },

    /**
     * Handler for key press events in the console input. Should only do
     * something if the console is enabled.
     */
    onConsoleKeyPress = function(e) {
        if (!cEnabled) {
            return;
        }
        // is this to blur the console? or some browser shortcut?
        // we do allow some non-character keys, like backspace and enter
        if (e.ctrlKey || (e.charCode === 0 &&
                ['Backspace', 'Enter', 'Tab'].indexOf(e.key) < 0)) {
            onKeyPress(e);
            return;
        }
        // handle key
        e.preventDefault();
        e.stopPropagation();
        var thisKeyIsTab = false;
        switch (e.key) {
            case 'Backspace':
                cInput = cInput.substr(0, cInput.length - 1);
                break;
            case 'Enter':
                setFeedback(parseCmd(cInput));
                cInput = '';
                break;
            case 'Tab':
                thisKeyIsTab = true;
                var matches = completeCmd(cInput);
                if (matches.length === 1) {
                    cInput = (matches.prefix ? matches.prefix + ' ' : '') +
                        matches[0] + ' ';
                } else if (matches.length > 1 && cLastKeyWasTab) {
                    setFeedback(matches);
                }
                break;
            default:
                if (cInput.length < cMaxLen) {
                    cInput += e.key;
                }
        }
        cLastKeyWasTab = thisKeyIsTab;
        // update text in input
        updateInput();
    },

    /**
     * Triggered for \c keypress events on the window. Should toggle the
     * console status for the activation key.
     */
    onKeyPress = function(e) {
        if (e.key === cToggleKey && e.ctrlKey) {
            e.preventDefault();
            e.stopPropagation();
            cEnabled = !cEnabled;
            if (cEnabled) {
                $i.focus();
            } else {
                $i.blur();
            }
        }
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
        $f.html(encode(str));
        $c.toggleClass('tall', (str != ''));
    },

    /**
     * Update input text from the global \c cInput variable.
     */
    updateInput = function() {
        $i.html(encode(cInput));
    }

    /**
     * Command definitions. Hey. Cheater! Reading the source and all that.
     * Well. Have fun, hacker :-)
     */
    cmds = {
        'about': alias('help'),
        'about-me': s('This is desh, the Denvelop Shell, programmed by Thom.'),
        'cd': function(path) {
            var options = completers.ls(path);
            if (options.length === 1) {
                var url = helpers.dirResolve(location.pathname, options[0]);
                $('#header a, .nav-link').
                    filter('[data-url="' + url + '"]').
                    click();
                return '';
            }
            return 'desh: Invalid path.';
        },
        'clear': function() { cInput = ''; $i.text(''); },
        'help': s('desh: This is a tiny console for geeks. No room for ' +
                    'further help, sorry.'),
        'ls': function(path) {
            var cwd = location.pathname,
                items = [];
            if (typeof(path) === 'string') {
                cwd = helpers.dirResolve(cwd, path);
                if (cwd === null) {
                    return 'desh: Invalid path.';
                }
            }
            $('#nav li > *').each(function(i, e) {
                var item = helpers.dirDiff(cwd, $(e).data('url'));
                if (item.indexOf('../') === -1) {
                    items.push(item);
                }
            });
            items.sort();
            if (items[0] !== '.') {
                return 'desh: Invalid path.';
            }
            return items;
        }
    },

    /**
     * Tab completion functions per command.
     */
    completers = {
        'cd': alias('ls', 'completers'),
        'ls': function(path) {
            if (typeof(path) !== 'string') return [];
            var dirName = path.split('/'),
                baseName = dirName.pop();
            if (!baseName) baseName = '';
            dirName = dirName.join('/');
            return helpers.filterPrefixed(baseName, cmds.ls(dirName)).
                map(function(c) {
                    if (dirName !== '') {
                        return dirName + '/' + c;
                    }
                    return c;
                });
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
            var d = dir.split('/'),
                lastSlash = (d[d.length - 1] === '');
            if (lastSlash) {
                d.pop();
            }

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
            return d.join('/');
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
        if ($c.size() > 0) {
            var initialText = $i.text(),
                feedbackUp = $f.text();
            // enable toggling the console
            $(window).on('keypress', onKeyPress);
            // enable console writing
            $i.on('keypress', onConsoleKeyPress);
            // update state if console is blurred/focused
            $i.on('focus', function() {
                $c.addClass('active');
                updateInput();
                setFeedback(feedbackUp);
            }).on('blur', function() {
                cEnabled = false; // in case blur happens outside our control
                $c.removeClass('active');
                $i.text(initialText);
                feedbackUp = $f.text();
                setFeedback('');
            });
        }
    });

}(jQuery, window, document));
