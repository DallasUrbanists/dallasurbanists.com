module ActivitiesGeneratorPlugin
    class ActivitiesGenerator < Jekyll::Generator
        safe true
        
        def generate(site)
            site.data["activities"] = [];

            site.collections['series'].docs.each do |series|
                series.data["dates"].each do |instance_date|
                    site.data["activities"].push(series.data.merge({
                        "type" => series.data["type"],
                        "title" => series.data["title"],
                        "author" => series.data["author"],
                        "start_date" => instance_date,
                        "end_date" => instance_date,
                        "series" => series.data["id"],
                        "icon" => series.data["icon"],
                        "url" => series.url
                    }))
                end
            end
            site.collections['events'].docs.each do |activity|
                site.data["activities"].push(activity.data.merge({
                    "type" => "Event",
                    "end_date" => activity.data["start_date"],
                    "icon" => "event",
                    "url" => activity.url
                }))
            end
            site.collections['bicyclerides'].docs.each do |activity|
                site.data["activities"].push(activity.data.merge({
                    "type" => "Bicycle Ride",
                    "end_date" => activity.data["start_date"], # bicycle rides are never multi-day events
                    "icon" => "bicycle",
                    "url" => activity.url
                }))
            end
            site.collections['petitions'].docs.each do |activity|
                site.data["activities"].push(activity.data.merge({
                    "type" => "Petition",
                    "icon" => "petition",
                    "url" => activity.url
                }))
            end
            site.collections['publiccomments'].docs.each do |activity|
                site.data["activities"].push(activity.data.merge({
                    "type" => "Public Comment",
                    "end_date" => activity.data["start_date"], # public comments are never multi-day events
                    "icon" => "public_comment",
                    "url" => activity.url
                }))
            end
            site.collections['writtencomments'].docs.each do |activity|
                site.data["activities"].push(activity.data.merge({
                    "type" => "Written Comment",
                    "end_date" => activity.data["start_date"], # written comments are never multi-day events
                    "icon" => "written_comment",
                    "url" => activity.url
                }))
            end
        end
    end
end