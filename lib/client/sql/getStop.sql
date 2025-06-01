SELECT stops.stop_id AS parent_stop_id,
       stops.stop_code AS parent_stop_code,
       stops.stop_name AS parent_stop_name,
       stops.stop_lat,
       stops.stop_lon,
       stops.parent_station,
       childstops.stop_id,
       childstops.stop_name,
       childstops.platform_code
FROM stops
LEFT JOIN stops AS childstops ON stops.stop_id = childstops.parent_station
WHERE stops.stop_id = (?)
