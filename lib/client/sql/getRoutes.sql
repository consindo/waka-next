SELECT routes.route_id,
       agency_id,
       route_short_name,
       route_long_name,
       route_desc,
       route_type,
       route_url,
       route_color,
       route_text_color,
       route_sort_order,
       continuous_pickup,
       continuous_drop_off,
       network_id,
       sum(monday + tuesday + wednesday + thursday + friday + saturday + sunday) as services_count
       -- count(CASE exception_type WHEN 1 THEN 1 ELSE NULL END) AS additions,
       -- count(CASE exception_type WHEN 2 THEN 1 ELSE NULL END) AS removals
FROM trips
INNER JOIN calendar ON trips.service_id = calendar.service_id
-- LEFT JOIN calendar_dates ON trips.service_id = calendar_dates.service_id
INNER JOIN routes ON routes.route_id = trips.route_id
WHERE route_type >= (?) AND route_type <= (?)
GROUP BY routes.route_id
-- Not perfect because it doesn't account for calendar_dates or frequencies
-- but should be good enough for a general "popularity" heuristic
ORDER BY services_count DESC LIMIT (?) OFFSET (?)
