module TagPageGeneratorPlugin
    class TagPageGenerator < Jekyll::Generator
      safe true
  
      def generate(site)
        site.tags.each do |tag, posts|
          site.pages << TagPage.new(site, tag, posts)
        end
      end
    end
  
    # Subclass of `Jekyll::Page` with custom method definitions.
    class TagPage < Jekyll::Page
      def initialize(site, tag, posts)
        @site = site             # the current site instance.
        @base = site.source      # path to the source directory.
        @dir  = "tagged"         # the directory the page will reside in.
  
        @basename = tag      # filename without the extension.
        @ext      = '.html'      # the extension.
        @name     = '#(tag).html' # basically @basename + @ext.

        item = (site.data["tags"]["items"].find_all {|t| t["name"] == tag})&.last()
        
        @data = {
            "layout" => "tag-feed",
            "tag_feed" => tag
        }
        
        if item != nil
          item.each do |key, value|
            if key != "name"
              data.store(key, value)
            end
          end
        end
      end
    end
  end
