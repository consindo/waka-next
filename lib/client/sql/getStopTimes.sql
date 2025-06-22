SELECT trips.trip_id,
       stop_times.stop_id,
       stop_times.arrival_time,
       stop_times.departure_time,
       stop_times.stop_sequence,
       stop_times.stop_headsign,
       trips.trip_headsign,
       trips.trip_short_name,
       trips.wheelchair_accessible,
       trips.bikes_allowed,
       trips.direction_id,
       routes.route_id,
       routes.route_type,
       routes.route_short_name,
       routes.route_long_name,
       routes.route_color,
       routes.route_text_color,
       agency.agency_name,
       agency.agency_url,
       agency.agency_fare_url,
       agency.agency_phone
FROM stop_times
INNER JOIN trips ON stop_times.trip_id = trips.trip_id
INNER JOIN routes ON trips.route_id = routes.route_id
INNER JOIN agency ON routes.agency_id = agency.agency_id
INNER JOIN calendar ON trips.service_id = calendar.service_id
LEFT JOIN calendar_dates ON trips.service_id = calendar_dates.service_id
AND date = (?)
WHERE stop_id = (?)
  AND pickup_type IS NOT 1
  AND ((start_date <= (?)
        AND end_date >= (?)
        AND CASE WHEN (?) = '1' THEN monday WHEN (?) = '1' THEN tuesday WHEN (?) = '1' THEN wednesday WHEN (?) = '1' THEN thursday WHEN (?) = '1' THEN friday WHEN (?) = '1' THEN saturday WHEN (?) = '1' THEN sunday ELSE '0' END = 1
        AND exception_type IS NULL)
       OR exception_type = 1)
ORDER BY departure_time ASC;

