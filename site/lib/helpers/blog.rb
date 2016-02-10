module BlogHelper

    def blog_image(name, opts = {})
        if File.extname(name) === ''
            name += '.jpg'
        end
        href = "/img/blog/vala2016/#{name}"
        isrc = href
        caption = ''
        if opts[:caption]
            caption = "<span class=\"blog-image-caption\">#{opts[:caption]}</span>"
        end

        # build output HTML
        classes = 'blog-image'
        if opts[:type] === 'pack-4'
            classes += ' pack-4'
            href = 'javascript:void(0);'
        end
        result = "<a class=\"#{classes}\" href=\"#{href}\">"
        extra_attrs = (opts[:extra_attrs] ? opts[:extra_attrs] : '')
        if opts[:type] === 'pack-4'
            for i in 1..4
                extra_attr = ''
                if opts[:extra_attrs].kind_of?(Array) and
                        opts[:extra_attrs].length >= i and
                        not opts[:extra_attrs][i - 1].nil?
                    for attr_key, attr_value in opts[:extra_attrs][i - 1]
                        extra_attr += ' ' + attr_key.to_s + '="' + attr_value + '"'
                    end
                end
                result += "<img src=\"#{sprintf isrc, i}\"#{extra_attr} />"
            end
        else
            result += "<img src=\"#{isrc}\"#{extra_attrs} />"
        end
        return result + "</a>#{caption}"
    end

end
