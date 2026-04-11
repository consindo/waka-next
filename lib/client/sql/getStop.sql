SELECT DISTINCT stops.stop_id AS parent_stop_id,
                stops.stop_code AS parent_stop_code,
                stops.stop_name AS parent_stop_name,
                stops.stop_desc AS parent_stop_desc,
                stops.stop_lat AS parent_stop_lat,
                stops.stop_lon AS parent_stop_lon,
                stops.parent_station,
                childstops.stop_id,
                childstops.stop_name,
                childstops.platform_code,
                childstops.stop_lat,
                childstops.stop_lon,
                routes.route_type,
                routes.route_short_name,
                routes.route_color,
                routes.route_text_color
FROM stops
LEFT JOIN stops AS childstops ON stops.stop_id = childstops.parent_station
LEFT JOIN stop_times ON stop_times.stop_id = stops.stop_id
OR stop_times.stop_id = childstops.stop_id
LEFT JOIN trips ON stop_times.trip_id = trips.trip_id
LEFT JOIN routes ON trips.route_id = routes.route_id
WHERE stops.stop_id = (?)
