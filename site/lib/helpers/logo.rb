module LogoHelper

    def logo(name)
        '<img class="logo" src="' + @items['/img/logos/' + name + '/'].path + '" alt="nanoc logo" title="nanoc logo" />'
    end

end
