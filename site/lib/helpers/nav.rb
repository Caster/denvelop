module NavHelper

    def nav_attrs(item)
        'data-id="' + item[:id] + '" data-url="' + item.path + '"'
    end

    def nav_link(item, text)
        '<a class="nav-link" ' + nav_attrs(item) + ' href="' +
                item.path + '">' + text + '</a>'
    end

end
