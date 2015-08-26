module LogoHelper

    def logo(name)
        '<img class="logo" src="' + @items['/img/logos/' + name + '.*'].path + '" alt="' + name + ' logo" title="' + name + ' logo" />'
    end

end
