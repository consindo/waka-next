SELECT route_id,
       agency_id,
       route_short_name,
       route_long_name,
       route_desc,
       route_type,
       route_url,
       route_color,
       route_text_color,
       route_sort_order,
       continuous_pickup,
       continuous_drop_off,
       network_id
FROM routes
WHERE route_id = (?);
