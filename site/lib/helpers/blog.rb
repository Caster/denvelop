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
        if opts[:type] === 'pack-4'
            for i in 1..4
                result += "<img src=\"#{sprintf isrc, i}\" />"
            end
        else
            result += "<img src=\"#{isrc}\" />"
        end
        return result + "</a>#{caption}"
    end

end
