-- this returns a list of all the routes that go to particular stops

SELECT DISTINCT stops.stop_id,
                parentstops.stop_id AS parent_stop_id,
                routes.route_type,
                routes.route_short_name,
                routes.route_color,
                routes.route_text_color
FROM stops
LEFT JOIN stops AS parentstops ON parentstops.stop_id = stops.parent_station
LEFT JOIN stop_times ON stop_times.stop_id = stops.stop_id
LEFT JOIN trips ON stop_times.trip_id = trips.trip_id
LEFT JOIN routes ON trips.route_id = routes.route_id
WHERE (stops.stop_id IN (?)
       OR parent_stop_id IN (?))
  AND route_short_name IS NOT NULL LIMIT 1000
