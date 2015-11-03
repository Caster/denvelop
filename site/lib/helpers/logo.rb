module LogoHelper

    def logo(name, href = nil, extraClasses = nil)
        (href.nil? ? '' : '<a href="' + href + '">') +
        '<img class="logo' +
        (extraClasses.nil? ? '' : ' ' + extraClasses) +
        '" src="' + @items['/img/logos/' + name.downcase + '.*'].path + '" alt="' + name + ' logo" title="' + name + ' logo" />' +
        (href.nil? ? '' : '</a>')
    end

end
