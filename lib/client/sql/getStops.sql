SELECT stop_id,
       stop_code,
       stop_name,
       stop_desc,
       stop_lat,
       stop_lon
FROM stops
WHERE parent_station IS NULL
  AND (stop_name LIKE (?)
       OR stop_code LIKE (?))
LIMIT 100
