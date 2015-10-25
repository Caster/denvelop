def available_themes()
    themes = []
    Dir['content/less/themes/*.less'].each{ |theme|
        themes.push theme.split('/').last.split('.')[0..-2].join('.')
    }
    themes.sort do |a, b|
        if a === 'default'
            -1
        elsif b === 'default'
            1
        else
            a <=> b
        end
    end
end

def theme_colors(theme)
    colors = {}
    IO.readlines("content/less/themes/#{theme}.less").each do |l|
        m = l.scan(/@color-([a-z\-]+)?: (#[0-9A-F]+);/i)
        if m.length === 1
            colors[m[0][0]] = m[0][1]
        end
    end
    colors
end

def theme_swatch(theme_colors)
    swatch = ''
    prop_map = {
        'main' => 'border-top-color',
        'main-dark' => 'border-bottom-color',
        'accent' => 'background-color'
    }
    theme_colors.each do |color, value|
        swatch += '<span class="' + color + '" style="' + prop_map[color] +
                ': ' + value + ';">&nbsp;</span>'
    end
    swatch
end
