require 'date'

module Jekyll
  module DateTimeRangeFilter
    def datetime_range_filter(start_date, end_date)
      parts = Array.new

      is_one_day = start_date.strftime('%d %b %Y') == end_date.strftime('%d %b %Y')
      is_this_year = DateTime.now.year == end_date.year

      if (is_one_day)
        is_same_time = start_date.strftime('%H:%M') == end_date.strftime('%H:%M')
        start_format = is_this_year ? '%B %e, %A %l:%M%P' : '%B %e, %Y, %A %l:%M%P'
        end_format = '%l:%M%P'

        if (is_same_time)
          return start_date.strftime(start_format)
        end

        return start_date.strftime(start_format) + ' to ' + end_date.strftime(end_format)
      end

      start_format = '%B %e %A %l:%M%P'
      end_format = is_this_year ? '%B %e %A %l:%M%P' : '%B %Y %A %l:%M%P, Y'

      return start_date.strftime(start_format) + ' to ' + end_date.strftime(end_format)
  end
  end
end

Liquid::Template.register_filter(Jekyll::DateTimeRangeFilter)