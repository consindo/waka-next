SELECT route_id,
       trip_headsign,
       direction_id,
       sum(monday + tuesday + wednesday + thursday + friday + saturday + sunday) AS services_count
FROM trips
INNER JOIN calendar ON trips.service_id = calendar.service_id
WHERE route_id = (?)
GROUP BY trip_headsign,
         direction_id
ORDER BY services_count DESC;
