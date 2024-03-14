module FeedGeneratorPlugin
    class FeedGenerator < Jekyll::Generator
        safe true
        
        def generate(site)
            site.data["feed"] = [];

            site.posts.docs.each do |post|
                if (post.data["category"])
                    type = post.data["category"] + ' article';
                else 
                    type = 'Article';
                end
                site.data["feed"].push(post.data.merge({
                    "url" => post.url,
                    "type" => type,
                    "icon" => "article"
                }))
            end

            site.collections['instagramreels'].docs.each do |post|
                site.data["feed"].push(post.data.merge({
                    "url" => post.url,
                    "type" => "Instagram Reel",
                    "icon" => "ig_reel"
                }))
            end
            site.data['ig_reels']['items'].each do |item|
                newData = item.merge({ "type" => "Instagram Reel", "icon" => "ig_reel" })
                newPage = InstagramEmbedPage.new(site, newData)
                site.pages << newPage
                site.data["feed"].push(newData.merge({ "url" => newPage.url }))
            end
            site.collections['instagramposts'].docs.each do |post|
                site.data["feed"].push(post.data.merge({
                    "url" => post.url,
                    "type" => "Instagram Post",
                    "icon" => "instagram"
                }))
            end
            site.data['ig_posts']['items'].each do |item|
                newData = item.merge({ "type" => "Instagram Post", "icon" => "instagram" })
                newPage = InstagramEmbedPage.new(site, newData)
                site.pages << newPage
                site.data["feed"].push(newData.merge({ "url" => newPage.url }))
            end
        end
    end

    class InstagramEmbedPage < Jekyll::Page
        def initialize(site, post)
          @site = site             # the current site instance.
          @base = site.source      # path to the source directory.
          @dir  = "instagram"      # the directory the page will reside in.
    
          slug = post["date"].strftime('%Y-%m-%d') + '-' + post["title"].downcase.strip.gsub(' ', '-').gsub(/[^\w-]/, '')

          @basename = slug          # filename without the extension.
          @ext      = '.html'       # the extension.
          @name     = '#(slug).html' # basically @basename + @ext.
          
          @data = post.merge({
              "layout" => "instagram_embed",
              "author" => "@DallasUrbanists"
          });
        end

        # Placeholders that are used in constructing page URL.
        def url_placeholders
        {
          :path       => @dir,
          :category   => @dir,
          :basename   => basename,
          :output_ext => output_ext,
        }
      end
    end
end