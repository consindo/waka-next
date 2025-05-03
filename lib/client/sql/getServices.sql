SELECT route_id,
       trip_headsign,
       direction_id,
       trips.trip_id,
       sum(monday + tuesday + wednesday + thursday + friday + saturday + sunday) AS services_count,
       departure_time
FROM trips
INNER JOIN calendar ON trips.service_id = calendar.service_id
INNER JOIN stop_times ON trips.trip_id = stop_times.trip_id
WHERE route_id = (?)
  AND stop_sequence = (?)
GROUP BY trip_headsign,
         trips.trip_id,
         direction_id
ORDER BY departure_time ASC;

