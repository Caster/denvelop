module LogoHelper

    def logo(name, href = nil)
        (href.nil? ? '' : '<a href="' + href + '">') +
        '<img class="logo" src="' + @items['/img/logos/' + name.downcase + '.*'].path + '" alt="' + name + ' logo" title="' + name + ' logo" />' +
        (href.nil? ? '' : '</a>')
    end

end
