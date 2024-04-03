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
                site.data["activities"].push(activity.data.merge!({
                    "type" => "Event",
                    "icon" => defined?(activity.icon) ? activity.icon : "event",
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
            site.collections['publiccomments'].docs.each do |activity|
                site.data["activities"].push(activity.data.merge({
                    "type" => "Public Comment",
                    "end_date" => activity.data["start_date"], # public comments are never multi-day events
                    "icon" => "public_comment",
                    "url" => activity.url
                }))
            end

            site.collections['specialdays'].docs.each do |activity|
                site.data["activities"].push(activity.data.merge({
                    "type" => "Special Day",
                    "icon" => "special_day",
                    "url" => activity.url
                }))
            end
        end
    end
end