module GoogleCalendarLinkGeneratorPlugin
    class GoogleCalendarLinkGenerator < Jekyll::Generator
        safe true
        
        def generate(site)
            site.collections['events'].docs.each do |event|
                iso_8601_format = '%Y%m%dT%H%M00'
                start_datetime_formatted = event.data['start_date'].strftime(iso_8601_format)
                end_datetime_formatted = event.data['end_date'].strftime(iso_8601_format)
                event_details = combineEventDetails(event)
                event_title = event.data['title']
                event_location = isOnlineOnly(event) ? event.data['virtual']['url'] : inPersonLocationOf(event)

                event.data.merge!({
                    'google_calendar_link' => sprintf(
                        'https://calendar.google.com/calendar/render?action=TEMPLATE&dates=%s%%2F%s&stz=America/Chicago&etz=America/Chicago&details=%s&location=%s&text=%s',
                        start_datetime_formatted,
                        CGI.escape(end_datetime_formatted),
                        CGI.escape(event_details),
                        CGI.escape(event_location),
                        CGI.escape(event_title)
                    ),
                    'in_person' => isInPerson(event),
                    'in_person_location' => inPersonLocationOf(event),
                    'online_only' => isOnlineOnly(event),
                    'start_iso_8601' => start_datetime_formatted,
                    'end_iso_8601' => end_datetime_formatted,
                    'created_iso_8601' => event.date.strftime("%Y%m%dT%H%M%S"),
                    'invite_details' => event_details.gsub("\n","\\n").gsub("\r","\\r"),
                    'invite_location' => event_location
                })

                iCalPage = ICalPage.new(site, event.data)
                site.pages << iCalPage
                event.data.merge!({ "ical_url" => iCalPage.url })
            end
        end

        def isInPerson(event)
            name = event.data['location']['name']
            address = event.data['location']['address']

            if name or address
                return true
            end

            return false
        end

        def inPersonLocationOf(event)
            name = event.data['location']['name']
            address = event.data['location']['address']

            if name and address
                return "#{name}, #{address}"
            end

            if name
                return name
            end
            
            if address
                return address
            end

            return ''
        end

        def isOnlineOnly(event)
            if isInPerson(event)
                return false
            end

            if event.data['virtual'] and (event.data['virtual']['url'] or event.data['virtual']['instructions'])
                return true
            end

            return false
        end

        def combineEventDetails(event)
            combined_details = ''

            if event.data['schedule'] or event.data['frequency']
                addition = "<b>SCHEDULE:</b> "
                if event.data['frequency']
                    addition << event.data['frequency'].concat(". ")
                end
                if event.data['schedule']
                    addition << event.data['schedule'] << ". "
                end
                combined_details << addition << "\r\n\r\n"
            end

            if isInPerson(event)
                in_person = true

                if event.data['location']['find_guide']
                    combined_details << "<b>HOW TO FIND:</b> " << event.data['location']['find_guide'] << "\r\n\r\n"
                end

                if event.data['location']['transit_guide']
                    combined_details << "<b>PUBLIC TRANSIT:</b> " << event.data['location']['transit_guide'] << "\r\n\r\n"
                end

                if event.data['location']['cycling_guide']
                    combined_details << "<b>CYCLING:</b> " << event.data['location']['cycling_guide'] << "\r\n\r\n"
                end

                if event.data['location']['parking_guide']
                    combined_details << "<b>PARKING:</b> " << event.data['location']['parking_guide'] << "\r\n\r\n"
                end
            else
                in_person = false
            end

            if event.data['virtual'] and (event.data['virtual']['url'] or event.data['virtual']['instructions'])
                addition = in_person ? "<b>HYBRID MEETING:</b> " : "<b>VIRTUAL MEETING:</b> "
                if event.data['virtual']['instructions']
                    addition << event.data['virtual']['instructions'] << ". "
                end
                if event.data['virtual']['url']
                    addition << event.data['virtual']['url'] << " "
                end
                combined_details << addition << "\r\n\r\n"
            end

            if event.data['rsvp']
                if event.data['rsvp']['requirement'] == 'No registration'
                    combined_details << event.data['rsvp']['pricing'] << ". There is no signup for this event."
                else
                    combined_details << "<b>" << event.data['rsvp']['requirement'] << "</b>" 
                    if event.data['rsvp']['deadline']
                        combined_details << "<b> before <u>" << event.data['rsvp']['deadline'].strftime('%B %e, %A %l:%M%P') << ".</u></b> "
                    end
                    if event.data['rsvp']['instructions']
                        combined_details << " " << event.data['rsvp']['instructions'] << "."
                    end
                    combined_details << ". " << event.data['rsvp']['pricing'] << ". "
                    if event.data['rsvp']['url']
                        combined_details << "\r\nRegister at " << event.data['rsvp']['url']
                    end
                    combined_details << "\r\n\r\n"
                end
            end

            if combined_details != ''
                combined_details << "<hr>\r\n"
            end

            combined_details << event.content
        end
    end

    class ICalPage < Jekyll::Page
        def initialize(site, event)
          @site = site             # the current site instance.
          @base = site.source      # path to the source directory.
          @dir  = "ical"           # the directory the page will reside in.
    
          slug = event["date"].strftime('%Y-%m-%d') + '-' + event["title"].downcase.strip.gsub(' ', '-').gsub(/[^\w-]/, '')

          @basename = slug          # filename without the extension.
          @ext      = '.ics'        # the extension.
          @name     = '#(slug).ics' # basically @basename + @ext.
          
          @data = event.merge({ "layout" => "ical" });
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