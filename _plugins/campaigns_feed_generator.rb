module CampaignsFeedGenerator
    class CampaignsFeedGenerator < Jekyll::Generator
        safe true
        
        def generate(site)
            site.data["campaigns_feed"] = [];

            site.collections['petitions'].docs.each do |activity|
                site.data["campaigns_feed"].push(activity.data.merge({
                    "type" => "Petition",
                    "icon" => "petition",
                    "url" => activity.url
                }))
            end
            site.collections['writtencomments'].docs.each do |activity|
                site.data["campaigns_feed"].push(activity.data.merge({
                    "type" => "Written Comment",
                    "icon" => "written_comment",
                    "url" => activity.url
                }))
            end
        end
    end
end