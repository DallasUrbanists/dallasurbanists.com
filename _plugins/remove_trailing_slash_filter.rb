module Jekyll
  module RemoveTrailingSlash
    def remove_trailing_slash(url)
      if url[-1] == '/'
        url[0..-2]
      else
        url
      end
    end
  end
end

Liquid::Template.register_filter(Jekyll::RemoveTrailingSlash)