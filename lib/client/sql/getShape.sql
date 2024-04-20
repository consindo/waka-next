SELECT shape_pt_lat,
       shape_pt_lon
FROM shapes
WHERE shape_id = (?)
ORDER BY shape_pt_sequence ASC
