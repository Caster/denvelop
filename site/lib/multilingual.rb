# http://nanoc.ws/docs/guides/creating-multilingual-sites/

#
# Mapping of language codes to the name of the language in that language itself.
#
LANGUAGE_CODE_TO_NAME_MAPPING = {
    'en' => 'English',
    'nl' => 'Nederlands'
}

#
# Returns the default language code.
#
def default_language()
    'nl'
end

#
# Returns a list of all language codes.
#
def language_codes()
    ret = []

    LANGUAGE_CODE_TO_NAME_MAPPING.each { |code, name|
        ret.push(code)
    }

    return ret
end

#
# Returns the language code associated with an item.
#
def language_code_of(item)
    # "/en/foo/" becomes "en"
    (item.identifier.without_ext.match(/^\/items\/([a-z]{2})\//) || [])[1]
end

#
# Returns all items that are translations of the given one.
#
def translations_of(item)
    @items.select do |i|
        i[:id] == item[:id]
    end
end

#
# Returns the name associated with the given language code.
#
def language_name_for_code(code)
    LANGUAGE_CODE_TO_NAME_MAPPING[code]
end

#
# Returns the name of the language of the given item.
#
def language_name_of(item)
    language_name_for_code(language_code_of(item))
end

#
# Returns an item in the same language as the given one, with the given ID. If
# that does not exist, then the English variant is returned. It is assumed that
# that one always exists.
#
def item_for_id(id, item)
    items = @items.select do |i|
        i[:id] == id && language_code_of(i) == language_code_of(item)
    end
    if items.length > 0
        return items[0]
    end

    # search for an English variant
    return (@items.select do |i|
        i[:id] == id && language_code_of(i) == 'en'
    end)[0]
end
