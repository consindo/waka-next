SELECT route_short_name,
       route_long_name,
       agency_id,
       route_type,
       route_color,
       route_desc,
       route_id
FROM routes
ORDER BY route_type
