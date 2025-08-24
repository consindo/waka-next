SELECT trips.route_id,
       trip_headsign,
       direction_id,
       trips.trip_id,
       departure_time,
       arrival_time,
       agency_timezone as timezone
FROM trips
INNER JOIN routes ON trips.route_id = routes.route_id
INNER JOIN agency ON routes.agency_id = agency.agency_id
INNER JOIN calendar ON trips.service_id = calendar.service_id
INNER JOIN stop_times ON trips.trip_id = stop_times.trip_id
LEFT JOIN calendar_dates ON trips.service_id = calendar_dates.service_id
AND date = (?)
WHERE trips.route_id = (?)
  AND stop_sequence = (?)
  AND ((start_date <= (?)
        AND end_date >= (?)
        AND CASE WHEN (?) = '1' THEN monday WHEN (?) = '1' THEN tuesday WHEN (?) = '1' THEN wednesday WHEN (?) = '1' THEN thursday WHEN (?) = '1' THEN friday WHEN (?) = '1' THEN saturday WHEN (?) = '1' THEN sunday ELSE '0' END = 1
        AND exception_type IS NULL)
       OR exception_type = 1)
ORDER BY departure_time ASC;

