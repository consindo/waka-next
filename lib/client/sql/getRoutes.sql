SELECT route_short_name,
       route_long_name,
       agency_id,
       route_type,
       route_color,
       route_desc,
       routes.route_id,
       trips.shape_id
FROM routes
LEFT JOIN trips ON routes.route_id = trips.route_id
ORDER BY route_type LIMIT 100
