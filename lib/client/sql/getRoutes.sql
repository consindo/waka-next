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
       sum(monday + tuesday + wednesday + thursday + friday + saturday + sunday) * COALESCE((((unixepoch(substr(0 || (end_time % 24), -2, 2) || substr(end_time, 3, 6)) + ((end_time / 24) * 86400)) - unixepoch(start_time)) / headway_secs), 1) AS services_count -- count(CASE exception_type WHEN 1 THEN 1 ELSE NULL END) AS additions,
 -- count(CASE exception_type WHEN 2 THEN 1 ELSE NULL END) AS removals
FROM trips
INNER JOIN calendar ON trips.service_id = calendar.service_id
INNER JOIN frequencies ON trips.trip_id = frequencies.trip_id -- LEFT JOIN calendar_dates ON trips.service_id = calendar_dates.service_id
INNER JOIN routes ON routes.route_id = trips.route_id
WHERE route_type LIKE (?)
GROUP BY routes.route_id -- Not perfect because it doesn't account for exceptions in frequency
-- but should be good enough for a general frequency heuristic
ORDER BY services_count DESC LIMIT 100 -- need to incorporate frequencies
