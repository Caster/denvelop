class StripSpaceFilter < Nanoc::Filter
    identifier :strip_space
    type :text

    def run(content, params={})
        content.split(/\n/).map.with_index{ |l, i|
                l.strip + (i == 0 ? "\n" : "")
            }.join + "\n"
    end
end
