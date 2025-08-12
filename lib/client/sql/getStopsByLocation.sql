SELECT DISTINCT stops.stop_id,
                stops.stop_code,
                stops.stop_name,
                parentstops.stop_id AS parent_stop_id,
                parentstops.stop_code AS parent_stop_code,
                parentstops.stop_name AS parent_stop_name,
                parentstops.stop_desc AS parent_stop_desc,
                parentstops.stop_lat AS parent_stop_lat,
                parentstops.stop_lon AS parent_stop_lon,
                stops.stop_desc,
                stops.stop_lat,
                stops.stop_lon,
                routes.route_type,
                routes.route_short_name,
                routes.route_color,
                routes.route_text_color
FROM stops
LEFT JOIN stops AS parentstops ON parentstops.stop_id = stops.parent_station
LEFT JOIN stop_times ON stop_times.stop_id = stops.stop_id
LEFT JOIN trips ON stop_times.trip_id = trips.trip_id
LEFT JOIN routes ON trips.route_id = routes.route_id
WHERE stops.stop_lat > (?)
  AND stops.stop_lat < (?)
  AND stops.stop_lon > (?)
  AND stops.stop_lon < (?)
ORDER BY stops.stop_lat DESC,
         stops.stop_lon DESC LIMIT 1000
