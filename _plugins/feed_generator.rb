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
            site.data['ig_reels']['items'].each do |reel|
                newPage = InstagramEmbedPage.new(site, reel["title"], reel["date"], reel["external_url"], reel["category"])

                site.pages << newPage

                site.data["feed"].push(reel.merge({
                    "type" => "Instagram Reel",
                    "icon" => "ig_reel",
                    "url" => newPage.url
                }))
            end
            site.collections['instagramcarousels'].docs.each do |post|
                site.data["feed"].push(post.data.merge({
                    "url" => post.url,
                    "type" => "Instagram Carousel",
                    "icon" => "instagram"
                }))
            end
            site.data['ig_carousels']['items'].each do |reel|
                newPage = InstagramEmbedPage.new(site, reel["title"], reel["date"], reel["external_url"], reel["category"])

                site.pages << newPage

                site.data["feed"].push(reel.merge({
                    "type" => "Instagram Carousel",
                    "icon" => "instagram",
                    "url" => newPage.url
                }))
            end
        end
    end

    class InstagramEmbedPage < Jekyll::Page
        def initialize(site, title, date, external_url, category)
          @site = site             # the current site instance.
          @base = site.source      # path to the source directory.
          @dir  = "instagram"         # the directory the page will reside in.
    
          slug = date.strftime('%Y-%m-%d') + '-' + title.downcase.strip.gsub(' ', '-').gsub(/[^\w-]/, '')

          @basename = slug          # filename without the extension.
          @ext      = '.html'       # the extension.
          @name     = '#(slug).html' # basically @basename + @ext.

          @data = {
              "layout" => "instagram_embed",
              "title" => title,
              "date" => date,
              "author" => "@DallasUrbanists",
              "external_url" => external_url,
              "category" => category
          };
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