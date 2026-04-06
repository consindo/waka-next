INSERT INTO not_bus_stops SELECT stops.stop_id,
       min(routes.route_type) AS route_type
FROM routes
INNER JOIN trips ON routes.route_id = trips.route_id
INNER JOIN stop_times ON trips.trip_id = stop_times.trip_id
INNER JOIN stops ON stop_times.stop_id = stops.stop_id
WHERE routes.route_type <> 3 -- normal gtfs bus
  AND (routes.route_type < 700
       OR routes.route_type > 800) -- extended gtfs bus + trolley bus
  AND (routes.route_type < 200
       OR routes.route_type > 209) -- extended gtfs coach
GROUP BY stops.stop_id;
