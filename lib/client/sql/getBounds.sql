SELECT max(stop_lat) AS max_lat,
       max(stop_lon) AS max_lon,
       min(stop_lat) AS min_lat,
       min(stop_lon) AS min_lon
FROM stops
