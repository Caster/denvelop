require 'json'

module NavHelper

    #
    # Returns href and id of a page if the given item is a page, nil otherwise.
    #
    def __is_page(item)
        href = item.identifier.to_s
        # only consider actual pages
        if href.start_with?('/items/')
            href = href[6, href.length - 6]
            # make sure we remove the default language from the url
            def_lang_prefix = '/' + default_language
            if href.start_with?(def_lang_prefix)
                href = href[def_lang_prefix.length,
                            href.length - def_lang_prefix.length]
            end
            return {
                id: item[:id],
                href: href.sub(/\.html$/, '/').sub(/index\//, '')
            }
        end
        return nil
    end

    def get_sitemap()
        map = []
        @items.each {|item|
            pageInfo = __is_page(item)
            if not pageInfo.nil?
                map.push(pageInfo[:href])
            end
        }
        return map
    end

    def get_sitemap_ids()
        map = {}
        @items.each {|item|
            pageInfo = __is_page(item)
            if not pageInfo.nil?
                map[pageInfo[:href]] = pageInfo[:id]
            end
        }
        return ::JSON.generate(map)
    end

    def nav_attrs(item)
        'data-id="' + item[:id] + '" data-url="' + item.path + '"'
    end

    def nav_link(item, text)
        '<a class="nav-link" ' + nav_attrs(item) + ' href="' +
                item.path + '">' + text + '</a>'
    end

end
