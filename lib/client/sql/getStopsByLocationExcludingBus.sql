-- optimized version that doesn't join to all the routes - we create not_bus_stops at time of import
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
                not_bus_stops.route_type
FROM not_bus_stops
LEFT JOIN stops ON not_bus_stops.stop_id = stops.stop_id
LEFT JOIN stops AS parentstops ON parentstops.stop_id = stops.parent_station
WHERE stops.stop_lat > (?)
  AND stops.stop_lat < (?)
  AND stops.stop_lon > (?)
  AND stops.stop_lon < (?)
ORDER BY stops.stop_lat DESC,
         stops.stop_lon DESC LIMIT 1000
