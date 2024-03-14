module Jekyll
  module ExtractDomainFilter
    def extract_domain(url)
        url.sub! 'https://', ''
        url.sub! 'http://', ''
        parts = url.split('/')
        parts[0]
    end
  end
end

Liquid::Template.register_filter(Jekyll::ExtractDomainFilter)