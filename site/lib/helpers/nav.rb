module NavHelper

    def nav_attrs(item)
        'data-id="' + item[:id] + '" data-url="' + item.path + '"'
    end

end
