SELECT trip_id,
       arrival_time,
       departure_time,
       stop_sequence,
       stop_headsign,
       pickup_type,
       drop_off_type,
       continuous_pickup,
       continuous_drop_off,
       shape_dist_traveled,
       timepoint,
       stops.stop_id,
       stops.stop_code,
       stops.stop_name,
       parent_stop.stop_id AS parent_stop_id,
       parent_stop.stop_code AS parent_stop_code,
       parent_stop.stop_name AS parent_stop_name
FROM stop_times
INNER JOIN stops ON stop_times.stop_id = stops.stop_id
LEFT JOIN stops AS parent_stop ON stops.parent_station = parent_stop.stop_id
WHERE trip_id = (?)
ORDER BY stop_sequence ASC
